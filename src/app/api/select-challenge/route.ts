import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { sendLowSpotsEmail } from '@/lib/email';

const LOW_SPOTS_THRESHOLD = 5;

export async function POST(request: NextRequest) {
  try {
    const { packageId, leadId } = await request.json();

    if (!packageId || typeof packageId !== 'string') {
      return NextResponse.json({ error: 'Missing packageId' }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Fetch the package + trainer in parallel
    const { data: pkg } = await supabase
      .from('packages')
      .select('id, trainer_id, name, is_challenge, challenge_spots_total, challenge_spots_remaining, low_spots_notified_at')
      .eq('id', packageId)
      .maybeSingle();

    if (!pkg || !pkg.is_challenge) {
      return NextResponse.json({ error: 'Not a challenge package' }, { status: 404 });
    }

    // Tag the lead with this package (already tracked in lead.selected_package_id)
    if (leadId) {
      await supabase.from('leads').update({ selected_package_id: packageId }).eq('id', leadId);
    }

    // If no cohort cap, nothing to decrement — just return ok.
    if (pkg.challenge_spots_total == null || pkg.challenge_spots_remaining == null) {
      return NextResponse.json({ ok: true, spotsRemaining: null });
    }

    const newRemaining = Math.max(0, pkg.challenge_spots_remaining - 1);

    // Atomic-ish guard: only decrement if the current remaining in the DB
    // still matches what we read. Prevents two concurrent decrements
    // double-dipping (not perfect, but good enough for low-volume challenges).
    const { error: updateError } = await supabase
      .from('packages')
      .update({ challenge_spots_remaining: newRemaining })
      .eq('id', pkg.id)
      .eq('challenge_spots_remaining', pkg.challenge_spots_remaining);

    if (updateError) {
      console.error('[select-challenge] update error:', updateError);
    }

    // Email the coach at 5 spots left (or fewer) — but only once per
    // dip. When spots refill above 5 via a settings save, the flag
    // is cleared by the onboarding route, so this fires again next
    // time the count drops.
    if (
      newRemaining <= LOW_SPOTS_THRESHOLD &&
      newRemaining > 0 &&
      !pkg.low_spots_notified_at
    ) {
      const { data: trainer } = await supabase
        .from('trainers')
        .select('name, user_id, slug')
        .eq('id', pkg.trainer_id)
        .maybeSingle();

      if (trainer?.user_id) {
        const { data: authUser } = await supabase.auth.admin.getUserById(trainer.user_id);
        const coachEmail = authUser?.user?.email;
        if (coachEmail) {
          const { origin } = new URL(request.url);
          void sendLowSpotsEmail({
            to: coachEmail,
            trainerName: trainer.name,
            challengeName: pkg.name,
            spotsRemaining: newRemaining,
            spotsTotal: pkg.challenge_spots_total,
            dashboardUrl: `${origin}/settings`,
          });
          await supabase
            .from('packages')
            .update({ low_spots_notified_at: new Date().toISOString() })
            .eq('id', pkg.id);
        }
      }
    }

    return NextResponse.json({ ok: true, spotsRemaining: newRemaining });
  } catch (error) {
    console.error('select-challenge error:', error);
    return NextResponse.json({ error: 'Failed to select challenge' }, { status: 500 });
  }
}
