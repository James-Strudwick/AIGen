import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

async function getTrainer(request: NextRequest) {
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

// GET — list flows for the trainer
export async function GET(request: NextRequest) {
  try {
    const trainer = await getTrainer(request);
    if (!trainer) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const supabase = getServiceClient();
    const { data: flows } = await supabase
      .from('flows')
      .select('*')
      .eq('trainer_id', trainer.id)
      .order('created_at');

    return NextResponse.json({ flows: flows || [] });
  } catch (error) {
    console.error('Flows GET error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST — create or update a flow
export async function POST(request: NextRequest) {
  try {
    const trainer = await getTrainer(request);
    if (!trainer) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    if (trainer.tier !== 'pro') return NextResponse.json({ error: 'Pro tier required for additional flows' }, { status: 403 });

    const { flowId, slug, name, goals, questions, specialties, services, packages, copy, aboutConfig } = await request.json();

    if (!slug || !name) {
      return NextResponse.json({ error: 'Slug and name are required' }, { status: 400 });
    }

    const supabase = getServiceClient();

    if (flowId) {
      const { error } = await supabase.from('flows').update({
        slug,
        name,
        goals: goals || null,
        questions: questions || null,
        specialties: specialties || null,
        services: services || null,
        packages: packages || null,
        copy: copy || null,
        about_config: aboutConfig || null,
      }).eq('id', flowId).eq('trainer_id', trainer.id);

      if (error) {
        if (error.code === '23505') return NextResponse.json({ error: 'A flow with this slug already exists' }, { status: 409 });
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
      }
    } else {
      // Check flow count for tier enforcement (belt-and-braces)
      const { count } = await supabase
        .from('flows')
        .select('id', { count: 'exact', head: true })
        .eq('trainer_id', trainer.id);
      if ((count ?? 0) >= 50) {
        return NextResponse.json({ error: 'Maximum 50 flows per account' }, { status: 403 });
      }

      const { error } = await supabase.from('flows').insert({
        trainer_id: trainer.id,
        slug,
        name,
        goals: goals || null,
        questions: questions || null,
        specialties: specialties || null,
        services: services || null,
        packages: packages || null,
        copy: copy || null,
        about_config: aboutConfig || null,
      });

      if (error) {
        if (error.code === '23505') return NextResponse.json({ error: 'A flow with this slug already exists' }, { status: 409 });
        return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Flows POST error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// DELETE — delete a flow
export async function DELETE(request: NextRequest) {
  try {
    const trainer = await getTrainer(request);
    if (!trainer) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { flowId } = await request.json();
    if (!flowId) return NextResponse.json({ error: 'Missing flowId' }, { status: 400 });

    const supabase = getServiceClient();
    await supabase.from('flows').delete().eq('id', flowId).eq('trainer_id', trainer.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Flows DELETE error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
