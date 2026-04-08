import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify JWT
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

    // Fetch trainer
    const { data: trainer } = await supabase
      .from('trainers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!trainer) {
      return NextResponse.json({ error: 'No trainer profile found' }, { status: 404 });
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
