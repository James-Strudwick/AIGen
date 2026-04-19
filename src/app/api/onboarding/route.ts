import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

interface PackageRow {
  name: string;
  sessions_per_week: number;
  price_per_session: number | null;
  monthly_price: number | null;
  is_online: boolean;
  is_challenge?: boolean;
  challenge_duration_weeks?: number | null;
  challenge_start_date?: string | null;
  challenge_outcome?: string | null;
  challenge_spots_total?: number | null;
}

export async function POST(request: NextRequest) {
  try {
    const { trainerId, trainerData, packages, goLive } = await request.json();

    if (!trainerId) {
      return NextResponse.json({ error: 'Missing trainerId' }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Update trainer record
    if (trainerData) {
      const updateData = { ...trainerData };
      if (goLive) {
        updateData.active = true;
      }
      const { error } = await supabase.from('trainers').update(updateData).eq('id', trainerId);
      if (error) {
        console.error('Trainer update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }
    }

    // Replace packages if provided
    if (packages) {
      const validPackages: PackageRow[] = packages.filter((p: { name: string }) => p.name?.trim());

      // Tier enforcement: Starter allows 1 challenge, Pro unlimited.
      const { data: trainer } = await supabase
        .from('trainers')
        .select('tier')
        .eq('id', trainerId)
        .single();
      const challengeCount = validPackages.filter(p => p.is_challenge).length;
      if (challengeCount > 1 && trainer?.tier !== 'pro') {
        return NextResponse.json(
          { error: 'Starter tier allows 1 challenge. Upgrade to Pro to run multiple challenges simultaneously.' },
          { status: 403 },
        );
      }

      // Preserve spots_remaining across re-saves: look up existing
      // packages by name before we blow them away, and clamp remaining
      // to min(existing remaining, new total) when the trainer tweaks
      // the cap upward or downward.
      const { data: oldPackages } = await supabase
        .from('packages')
        .select('name, challenge_spots_remaining, low_spots_notified_at')
        .eq('trainer_id', trainerId);
      const oldByName = new Map<string, { remaining: number | null; notifiedAt: string | null }>();
      for (const p of oldPackages || []) {
        oldByName.set(p.name as string, {
          remaining: p.challenge_spots_remaining as number | null,
          notifiedAt: p.low_spots_notified_at as string | null,
        });
      }

      await supabase.from('packages').delete().eq('trainer_id', trainerId);

      if (validPackages.length > 0) {
        const rows = validPackages.map((p, i) => {
          const old = oldByName.get(p.name);
          let remaining: number | null = null;
          if (p.is_challenge && p.challenge_spots_total != null) {
            if (old && old.remaining != null) {
              // Preserve prior signups, clamped to new total.
              remaining = Math.min(old.remaining, p.challenge_spots_total);
            } else {
              remaining = p.challenge_spots_total;
            }
          }
          return {
            ...p,
            trainer_id: trainerId,
            sort_order: i + 1,
            challenge_spots_remaining: remaining,
            // Keep the low-spots notification flag if this is the same
            // challenge (by name) and it's still above the threshold.
            low_spots_notified_at: p.is_challenge && remaining != null && remaining <= 5
              ? (old?.notifiedAt ?? null)
              : null,
          };
        });

        const { error } = await supabase.from('packages').insert(rows);
        if (error) {
          console.error('Packages insert error:', error);
          return NextResponse.json({ error: 'Failed to save packages' }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
