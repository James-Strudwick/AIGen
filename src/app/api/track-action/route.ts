import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { leadId, action } = await request.json();

    if (!leadId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const updates: Record<string, unknown> = {};

    if (action === 'whatsapp_clicked') {
      updates.status = 'whatsapp_sent';
      updates.whatsapp_clicked_at = new Date().toISOString();
    } else if (action === 'booking_clicked') {
      updates.status = 'call_booked';
      updates.booking_clicked_at = new Date().toISOString();
    } else if (action === 'converted') {
      updates.status = 'converted';
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await supabase.from('leads').update(updates).eq('id', leadId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Track action error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
