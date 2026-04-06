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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    // Verify user
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const supabase = getServiceClient();

    // Get trainer record
    const { data: trainer } = await supabase
      .from('trainers')
      .select('id, stripe_subscription_id, stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!trainer) return NextResponse.json({ error: 'No account found' }, { status: 404 });

    // Cancel Stripe subscription if active
    if (trainer.stripe_subscription_id) {
      try {
        await getStripe().subscriptions.cancel(trainer.stripe_subscription_id);
      } catch (err) {
        console.error('Failed to cancel subscription:', err);
      }
    }

    // Delete all leads for this trainer
    await supabase.from('leads').delete().eq('trainer_id', trainer.id);

    // Delete all packages
    await supabase.from('packages').delete().eq('trainer_id', trainer.id);

    // Delete trainer record
    await supabase.from('trainers').delete().eq('id', trainer.id);

    // Delete auth user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error('Failed to delete auth user:', deleteError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
