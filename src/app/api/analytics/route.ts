import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// POST — track a form event (public, fire-and-forget)
export async function POST(request: NextRequest) {
  try {
    const { trainerId, sessionId, step, action } = await request.json();
    if (!trainerId || !sessionId || !step || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = getServiceClient();
    await supabase.from('form_events').insert({
      trainer_id: trainerId,
      session_id: sessionId,
      step,
      action,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// GET — fetch analytics for authenticated trainer
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const supabase = getServiceClient();
    const { data: trainer } = await supabase
      .from('trainers')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!trainer) return NextResponse.json({ error: 'No trainer' }, { status: 404 });

    // Get events from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: events } = await supabase
      .from('form_events')
      .select('step, action, session_id')
      .eq('trainer_id', trainer.id)
      .gte('created_at', thirtyDaysAgo);

    // Calculate funnel stats
    const steps = ['hero', 'goal', 'about', 'availability', 'questions', 'capture', 'results'];
    const stepEntered: Record<string, Set<string>> = {};
    const stepCompleted: Record<string, Set<string>> = {};

    for (const s of steps) {
      stepEntered[s] = new Set();
      stepCompleted[s] = new Set();
    }

    for (const event of events || []) {
      if (event.action === 'entered') {
        stepEntered[event.step]?.add(event.session_id);
      } else if (event.action === 'completed') {
        stepCompleted[event.step]?.add(event.session_id);
      }
    }

    const funnel = steps.map((step) => ({
      step,
      entered: stepEntered[step]?.size || 0,
      completed: stepCompleted[step]?.size || 0,
      dropoff: (stepEntered[step]?.size || 0) - (stepCompleted[step]?.size || 0),
    })).filter(s => s.entered > 0 || s.completed > 0);

    const totalSessions = stepEntered['hero']?.size || stepEntered['goal']?.size || 0;

    return NextResponse.json({ funnel, totalSessions });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
