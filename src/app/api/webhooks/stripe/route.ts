import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { getTierForCount } from '@/lib/referral-tiers';
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
      const tier = session.metadata?.tier || 'starter';
      if (trainerId && session.subscription) {
        await supabase.from('trainers').update({
          stripe_subscription_id: session.subscription as string,
          subscription_status: 'active',
          active: true,
          tier,
        }).eq('id', trainerId);

        // Increment referrer's count if this trainer was referred
        const { data: newTrainer } = await supabase
          .from('trainers')
          .select('referred_by')
          .eq('id', trainerId)
          .single();

        if (newTrainer?.referred_by) {
          const { data: referrer } = await supabase
            .from('trainers')
            .select('id, referral_count, referral_tier_reached, has_referral_discount, stripe_subscription_id, tier')
            .eq('referral_code', newTrainer.referred_by)
            .single();

          if (referrer) {
            const newCount = (referrer.referral_count || 0) + 1;
            const prevTier = referrer.referral_tier_reached || 0;
            const updates: Record<string, unknown> = { referral_count: newCount };

            // Check if they just crossed a new tier
            const rewardTier = getTierForCount(newCount);
            if (rewardTier && newCount > prevTier) {
              updates.referral_tier_reached = newCount;

              // Tier 5: lifetime 50% off — cap at 50 users globally
              if (rewardTier.globalCap) {
                const { count } = await supabase
                  .from('trainers')
                  .select('id', { count: 'exact', head: true })
                  .gte('referral_tier_reached', rewardTier.tier);
                const taken = count ?? 0;
                if (taken >= rewardTier.globalCap) {
                  // Cap reached — still record the tier but skip the discount
                  await supabase.from('trainers').update(updates).eq('id', referrer.id);
                  break;
                }
                updates.has_referral_discount = true;
              }

              // Tier 4: upgrade to Pro if on Starter
              if (rewardTier.upgradesPro && referrer.tier === 'starter') {
                updates.tier = 'pro';
                updates.pro_trial_ends_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
              }

              // Apply the Stripe coupon if they have an active subscription
              if (referrer.stripe_subscription_id) {
                try {
                  const stripe = getStripe();
                  const { couponId, coupon: couponDef } = rewardTier;
                  let coupon: Stripe.Coupon;
                  try {
                    coupon = await stripe.coupons.retrieve(couponId);
                  } catch {
                    coupon = await stripe.coupons.create({
                      id: couponId,
                      percent_off: couponDef.percent_off,
                      duration: couponDef.duration,
                      ...(couponDef.duration_in_months ? { duration_in_months: couponDef.duration_in_months } : {}),
                      name: couponDef.name,
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
