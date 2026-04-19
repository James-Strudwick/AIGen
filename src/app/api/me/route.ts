import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

const OWNER_ID = 'd4afd45e-777b-49ad-a0fe-ae5b4ff3d22b';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const supabase = getServiceClient();

    // Admin override: owner can load any trainer by slug
    const { searchParams } = new URL(request.url);
    const adminSlug = searchParams.get('slug');
    let trainer;

    if (adminSlug && user.id === OWNER_ID) {
      const { data } = await supabase.from('trainers').select('*').eq('slug', adminSlug).single();
      trainer = data;
    } else {
      const { data } = await supabase.from('trainers').select('*').eq('user_id', user.id).single();
      trainer = data;
    }

    if (!trainer) {
      return NextResponse.json({ error: 'No trainer profile found' }, { status: 404 });
    }

    // Revert expired Pro trials (tier 4 reward)
    if (trainer.pro_trial_ends_at && new Date(trainer.pro_trial_ends_at) < new Date() && trainer.tier === 'pro') {
      // Only revert if they don't have a Pro subscription — check metadata
      // to distinguish "earned Pro" vs "tier-4 trial Pro".
      // Simple heuristic: if pro_trial_ends_at exists and expired, revert.
      await supabase.from('trainers').update({
        tier: 'starter',
        pro_trial_ends_at: null,
      }).eq('id', trainer.id);
      trainer.tier = 'starter';
      trainer.pro_trial_ends_at = null;
    }

    // Fetch packages
    const { data: packages } = await supabase
      .from('packages')
      .select('*')
      .eq('trainer_id', trainer.id)
      .order('sort_order');

    // Fetch forms
    const { data: forms } = await supabase
      .from('forms')
      .select('*')
      .eq('trainer_id', trainer.id)
      .eq('active', true);

    // Fetch leads
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('trainer_id', trainer.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      trainer,
      packages: packages || [],
      forms: forms || [],
      leads: leads || [],
    });
  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
