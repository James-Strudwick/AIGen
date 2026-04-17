import { getServiceClient } from '@/lib/supabase';
import { Trainer, Package, Flow } from '@/types';
import { notFound } from 'next/navigation';
import TrainerPage from '../../../[slug]/TrainerPage';

interface Props {
  params: Promise<{ slug: string; flowSlug: string }>;
}

export default async function EmbedFlowPage({ params }: Props) {
  const { slug, flowSlug } = await params;
  const supabase = getServiceClient();

  const { data: trainer } = await supabase
    .from('trainers')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!trainer || !trainer.active) notFound();

  const { data: flow } = await supabase
    .from('flows')
    .select('*')
    .eq('trainer_id', trainer.id)
    .eq('slug', flowSlug)
    .eq('active', true)
    .single();

  if (!flow) notFound();

  const mergedTrainer: Trainer = {
    ...trainer,
    custom_goals: (flow as Flow).goals ?? trainer.custom_goals,
    custom_questions: (flow as Flow).questions ?? trainer.custom_questions,
    specialties: (flow as Flow).specialties ?? trainer.specialties,
    services: (flow as Flow).services ?? trainer.services,
    copy: {
      hero_headline: (flow as Flow).copy?.hero_headline ?? trainer.copy?.hero_headline ?? '',
      hero_subtext: (flow as Flow).copy?.hero_subtext ?? trainer.copy?.hero_subtext ?? '',
      cta_button_text: (flow as Flow).copy?.cta_button_text ?? trainer.copy?.cta_button_text ?? '',
      tone: (flow as Flow).copy?.tone ?? trainer.copy?.tone ?? '',
    },
  } as Trainer;

  let packages: Package[] = [];
  if ((flow as Flow).packages && (flow as Flow).packages!.length > 0) {
    packages = (flow as Flow).packages!.map((p, i) => ({
      ...p,
      id: p.id || `flow-pkg-${i}`,
      trainer_id: trainer.id,
      description: p.description ?? null,
      sort_order: p.sort_order ?? i + 1,
      is_challenge: p.is_challenge ?? false,
      challenge_duration_weeks: p.challenge_duration_weeks ?? null,
      challenge_start_date: p.challenge_start_date ?? null,
      challenge_outcome: p.challenge_outcome ?? null,
      challenge_spots_total: p.challenge_spots_total ?? null,
      challenge_spots_remaining: p.challenge_spots_remaining ?? null,
    }));
  } else {
    const { data: trainerPkgs } = await supabase
      .from('packages')
      .select('*')
      .eq('trainer_id', trainer.id)
      .order('sort_order');
    packages = (trainerPkgs ?? []) as Package[];
  }

  return (
    <TrainerPage
      trainer={mergedTrainer}
      packages={packages}
      forms={[]}
      isEmbed
    />
  );
}

export async function generateMetadata() {
  return {
    robots: { index: false, follow: false },
  };
}
