import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

async function getTrainerId(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return null;

  const supabase = getServiceClient();
  const { data: trainer } = await supabase
    .from('trainers')
    .select('id, tier')
    .eq('user_id', user.id)
    .single();

  return trainer;
}

// GET — list forms for the trainer
export async function GET(request: NextRequest) {
  try {
    const trainer = await getTrainerId(request);
    if (!trainer) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const supabase = getServiceClient();
    const { data: forms } = await supabase
      .from('forms')
      .select('*')
      .eq('trainer_id', trainer.id)
      .order('created_at');

    return NextResponse.json({ forms: forms || [] });
  } catch (error) {
    console.error('Forms GET error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST — create or update a form
export async function POST(request: NextRequest) {
  try {
    const trainer = await getTrainerId(request);
    if (!trainer) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    if (trainer.tier !== 'pro') return NextResponse.json({ error: 'Pro tier required' }, { status: 403 });

    const { formId, goalId, name, questions, services, packages, copy, specialties, aboutConfig } = await request.json();

    const supabase = getServiceClient();

    if (formId) {
      // Update
      const { error } = await supabase.from('forms').update({
        goal_id: goalId,
        name,
        questions: questions || null,
        services: services || null,
        packages: packages || null,
        copy: copy || null,
        specialties: specialties || null,
        about_config: aboutConfig || null,
      }).eq('id', formId).eq('trainer_id', trainer.id);

      if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    } else {
      // Create
      const { error } = await supabase.from('forms').insert({
        trainer_id: trainer.id,
        goal_id: goalId,
        name,
        questions: questions || null,
        services: services || null,
        packages: packages || null,
        copy: copy || null,
        specialties: specialties || null,
        about_config: aboutConfig || null,
      });

      if (error) return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Forms POST error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// DELETE — delete a form
export async function DELETE(request: NextRequest) {
  try {
    const trainer = await getTrainerId(request);
    if (!trainer) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { formId } = await request.json();
    if (!formId) return NextResponse.json({ error: 'Missing formId' }, { status: 400 });

    const supabase = getServiceClient();
    await supabase.from('forms').delete().eq('id', formId).eq('trainer_id', trainer.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Forms DELETE error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
