import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil',
  });
}

export async function POST(request: NextRequest) {
  try {
    // Verify the user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    // Get trainer record
    const supabase = getServiceClient();
    const { data: trainer } = await supabase
      .from('trainers')
      .select('id, stripe_customer_id, name, has_referral_discount')
      .eq('user_id', user.id)
      .single();

    if (!trainer) return NextResponse.json({ error: 'No trainer found' }, { status: 404 });

    // Create or reuse Stripe customer
    let customerId = trainer.stripe_customer_id;
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        name: trainer.name,
        metadata: { trainer_id: trainer.id },
      });
      customerId = customer.id;
      await supabase.from('trainers').update({ stripe_customer_id: customerId }).eq('id', trainer.id);
    }

    // Ensure referral coupon exists if needed
    const stripe = getStripe();
    let discounts: { coupon: string }[] | undefined;
    if (trainer.has_referral_discount) {
      try {
        await stripe.coupons.retrieve('REFERRAL50');
      } catch {
        await stripe.coupons.create({
          id: 'REFERRAL50',
          percent_off: 50,
          duration: 'forever',
          name: 'Referral reward — 50% off for life',
        });
      }
      discounts = [{ coupon: 'REFERRAL50' }];
    }

    // Create checkout session
    const { origin } = new URL(request.url);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: 'FomoForms Pro',
            description: 'Unlimited leads, branded landing page, AI timelines',
          },
          unit_amount: 999, // £9.99
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      ...(discounts ? { discounts } : {}),
      success_url: `${origin}/dashboard?subscribed=true`,
      cancel_url: `${origin}/dashboard`,
      metadata: { trainer_id: trainer.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
