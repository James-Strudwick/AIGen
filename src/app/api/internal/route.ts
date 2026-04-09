import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

const OWNER_ID = 'd4afd45e-777b-49ad-a0fe-ae5b4ff3d22b';

async function verifyOwner(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await authClient.auth.getUser();
  return user?.id === OWNER_ID;
}

// POST — create a demo trainer
export async function POST(request: NextRequest) {
  if (!(await verifyOwner(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { name, slug, bio, goals, packages, specialties, services, questions, brandColor } = await request.json();

    const supabase = getServiceClient();

    // Check slug is available
    const { data: existing } = await supabase.from('trainers').select('id').eq('slug', slug).single();
    if (existing) {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 400 });
    }

    const { error } = await supabase.from('trainers').insert({
      slug,
      name,
      bio: bio || null,
      brand_color_primary: brandColor || '#1a1a1a',
      brand_color_secondary: '#f5f5f7',
      booking_link: '',
      contact_method: 'whatsapp',
      contact_value: '+447700000000',
      active: true,
      subscription_status: 'active',
      tier: 'pro',
      custom_goals: goals || null,
      custom_questions: questions || null,
      specialties: specialties || null,
      services: services || null,
      branding: {
        color_primary: brandColor || '#1a1a1a',
        color_secondary: '#f5f5f7',
        color_accent: brandColor || '#1a1a1a',
        color_background: '#ffffff',
        color_text: '#1a1a1a',
        color_text_muted: '#8e8e93',
        color_card: '#f5f5f7',
        color_border: '#e5e5ea',
        font_heading: 'system-ui',
        font_body: 'system-ui',
        theme: 'light',
        hero_image_url: null,
        hero_overlay_opacity: 0.6,
      },
    });

    if (error) {
      console.error('Create demo error:', error);
      return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }

    // Insert packages if provided
    if (packages?.length > 0) {
      const { data: trainer } = await supabase.from('trainers').select('id').eq('slug', slug).single();
      if (trainer) {
        await supabase.from('packages').insert(
          packages.map((p: Record<string, unknown>, i: number) => ({
            trainer_id: trainer.id,
            name: p.name,
            sessions_per_week: p.sessions_per_week || 0,
            price_per_session: p.price_per_session || null,
            monthly_price: p.monthly_price || null,
            is_online: p.is_online || false,
            sort_order: i + 1,
          }))
        );
      }
    }

    return NextResponse.json({ slug, url: `https://fomoforms.com/${slug}` });
  } catch (error) {
    console.error('Internal API error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// GET — list all demo trainers (no user_id = created by admin)
export async function GET(request: NextRequest) {
  if (!(await verifyOwner(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabase = getServiceClient();
  const { data } = await supabase
    .from('trainers')
    .select('slug, name, created_at')
    .is('user_id', null)
    .order('created_at', { ascending: false });

  return NextResponse.json({ demos: data || [] });
}

// DELETE — delete a demo trainer
export async function DELETE(request: NextRequest) {
  if (!(await verifyOwner(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { slug } = await request.json();
  const supabase = getServiceClient();

  const { data: trainer } = await supabase.from('trainers').select('id, user_id').eq('slug', slug).single();
  if (!trainer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (trainer.user_id) return NextResponse.json({ error: 'Cannot delete a real user' }, { status: 400 });

  await supabase.from('packages').delete().eq('trainer_id', trainer.id);
  await supabase.from('leads').delete().eq('trainer_id', trainer.id);
  await supabase.from('forms').delete().eq('trainer_id', trainer.id);
  await supabase.from('trainers').delete().eq('id', trainer.id);

  return NextResponse.json({ ok: true });
}
