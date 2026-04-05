import { supabase } from '@/lib/supabase';
import { Trainer, Package } from '@/types';
import { notFound } from 'next/navigation';
import TrainerPage from './TrainerPage';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PTLandingPage({ params }: Props) {
  const { slug } = await params;

  const { data: trainer } = await supabase
    .from('trainers')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (!trainer) {
    notFound();
  }

  const { data: packages } = await supabase
    .from('packages')
    .select('*')
    .eq('trainer_id', trainer.id)
    .order('sort_order');

  return (
    <TrainerPage
      trainer={trainer as Trainer}
      packages={(packages ?? []) as Package[]}
    />
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  const { data: trainer } = await supabase
    .from('trainers')
    .select('name, bio')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (!trainer) return { title: 'Not Found' };

  return {
    title: `${trainer.name} — Personalised Fitness Timeline`,
    description: trainer.bio || `Get your free personalised fitness timeline from ${trainer.name}`,
  };
}
