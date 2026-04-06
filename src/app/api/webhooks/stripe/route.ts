import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil',
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getServiceClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const trainerId = session.metadata?.trainer_id;
      if (trainerId && session.subscription) {
        await supabase.from('trainers').update({
          stripe_subscription_id: session.subscription as string,
          subscription_status: 'active',
          active: true,
        }).eq('id', trainerId);

        // Increment referrer's count if this trainer was referred
        const { data: newTrainer } = await supabase
          .from('trainers')
          .select('referred_by')
          .eq('id', trainerId)
          .single();

        if (newTrainer?.referred_by) {
          // Increment referral count
          const { data: referrer } = await supabase
            .from('trainers')
            .select('id, referral_count, has_referral_discount, stripe_subscription_id')
            .eq('referral_code', newTrainer.referred_by)
            .single();

          if (referrer) {
            const newCount = (referrer.referral_count || 0) + 1;
            const updates: Record<string, unknown> = { referral_count: newCount };

            // Hit 5 referrals — apply 50% discount
            if (newCount >= 5 && !referrer.has_referral_discount) {
              updates.has_referral_discount = true;

              // Apply 50% coupon if they already have a subscription
              // If not, the coupon will be applied at checkout time
              if (referrer.stripe_subscription_id) {
                try {
                  const stripe = getStripe();
                  let coupon;
                  try {
                    coupon = await stripe.coupons.retrieve('REFERRAL50');
                  } catch {
                    coupon = await stripe.coupons.create({
                      id: 'REFERRAL50',
                      percent_off: 50,
                      duration: 'forever',
                      name: 'Referral reward — 50% off for life',
                    });
                  }
                  await stripe.subscriptions.update(referrer.stripe_subscription_id, {
                    discounts: [{ coupon: coupon.id }],
                  });
                } catch (stripeErr) {
                  console.error('Failed to apply referral discount:', stripeErr);
                }
              }
            }

            await supabase.from('trainers').update(updates).eq('id', referrer.id);
          }
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const status = subscription.status === 'active' ? 'active'
        : subscription.status === 'past_due' ? 'past_due'
        : 'cancelled';

      const updates: Record<string, unknown> = {
        subscription_status: status,
        active: status === 'active',
      };

      if (subscription.cancel_at) {
        updates.subscription_ends_at = new Date(subscription.cancel_at * 1000).toISOString();
      }

      await supabase.from('trainers').update(updates)
        .eq('stripe_customer_id', customerId);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabase.from('trainers').update({
        subscription_status: 'cancelled',
        active: false,
        stripe_subscription_id: null,
      }).eq('stripe_customer_id', customerId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
