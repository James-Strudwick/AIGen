import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { getHighestUnlockedTier } from '@/lib/referral-tiers';
import Stripe from 'stripe';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil',
  });
}

const TIERS = {
  starter: { name: 'FomoForms Starter', amount: 999, description: 'Unlimited leads, branded landing page, AI timelines' },
  pro: { name: 'FomoForms Pro', amount: 1999, description: 'Everything in Starter + no watermark, CSV export, unlimited questions' },
};

export async function POST(request: NextRequest) {
  try {
    const { tier = 'starter' } = await request.json().catch(() => ({ tier: 'starter' }));
    const tierConfig = TIERS[tier as keyof typeof TIERS] || TIERS.starter;

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
      .select('id, stripe_customer_id, name, has_referral_discount, referral_tier_reached')
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

    // Apply the best referral coupon the trainer has earned (if any).
    // has_referral_discount is the legacy flag for tier 5 (50% off for life).
    // referral_tier_reached covers the newer tiered system.
    const stripe = getStripe();
    let discounts: { coupon: string }[] | undefined;
    const tierReached = trainer.referral_tier_reached || 0;
    const activeTier = tierReached > 0 ? getHighestUnlockedTier(tierReached) : null;

    if (activeTier || trainer.has_referral_discount) {
      const tierDef = activeTier ?? { couponId: 'REFERRAL50', coupon: { percent_off: 50, duration: 'forever' as const, name: 'Referral reward — 50% off for life' } };
      try {
        await stripe.coupons.retrieve(tierDef.couponId);
      } catch {
        await stripe.coupons.create({
          id: tierDef.couponId,
          percent_off: tierDef.coupon.percent_off,
          duration: tierDef.coupon.duration,
          ...('duration_in_months' in tierDef.coupon && tierDef.coupon.duration_in_months ? { duration_in_months: tierDef.coupon.duration_in_months } : {}),
          name: tierDef.coupon.name,
        });
      }
      discounts = [{ coupon: tierDef.couponId }];
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
            name: tierConfig.name,
            description: tierConfig.description,
          },
          unit_amount: tierConfig.amount,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      ...(discounts ? { discounts } : {}),
      success_url: `${origin}/dashboard?subscribed=true`,
      cancel_url: `${origin}/dashboard`,
      metadata: { trainer_id: trainer.id, tier },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
