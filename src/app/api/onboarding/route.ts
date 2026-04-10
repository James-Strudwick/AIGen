import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

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
      await supabase.from('packages').delete().eq('trainer_id', trainerId);
      const validPackages = packages.filter((p: { name: string }) => p.name?.trim());
      if (validPackages.length > 0) {
        const { error } = await supabase.from('packages').insert(
          validPackages.map((p: Record<string, unknown>, i: number) => ({
            ...p,
            trainer_id: trainerId,
            sort_order: i + 1,
          }))
        );
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
