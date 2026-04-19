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
      // Auto-create a trainer record so new users land straight on the
      // dashboard with the setup checklist — no separate onboarding page.
      const name = user.user_metadata?.name || user.email?.split('@')[0] || 'Coach';
      const baseSlug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim() || 'coach';

      // Ensure slug is unique
      let slug = baseSlug;
      let attempt = 0;
      while (true) {
        const { data: existing } = await supabase.from('trainers').select('id').eq('slug', slug).single();
        if (!existing) break;
        attempt++;
        slug = `${baseSlug}-${attempt}`;
      }

      // Generate referral code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let referralCode = '';
      for (let i = 0; i < 6; i++) referralCode += chars[Math.floor(Math.random() * chars.length)];

      const { data: newTrainer, error: insertError } = await supabase.from('trainers').insert({
        user_id: user.id,
        slug,
        name,
        brand_color_primary: '#1a1a1a',
        brand_color_secondary: '#f5f5f7',
        booking_link: '',
        contact_method: 'whatsapp',
        contact_value: '',
        active: false,
        referral_code: referralCode,
      }).select('*').single();

      if (insertError || !newTrainer) {
        console.error('Auto-create trainer error:', insertError);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }

      trainer = newTrainer;
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
