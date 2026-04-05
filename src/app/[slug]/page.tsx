import { getServiceClient } from '@/lib/supabase';
import { Trainer, Package } from '@/types';
import { notFound } from 'next/navigation';
import TrainerPage from './TrainerPage';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PTLandingPage({ params }: Props) {
  const { slug } = await params;
  const supabase = getServiceClient();

  const { data: trainer } = await supabase
    .from('trainers')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!trainer) {
    notFound();
  }

  // If page isn't active (no subscription), show inactive page
  if (!trainer.active) {
    return (
      <div className="min-h-[100dvh] bg-white flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-[#f5f5f7] flex items-center justify-center text-xl font-bold text-[#1a1a1a]"
            style={{ backgroundColor: trainer.brand_color_primary + '20', color: trainer.brand_color_primary }}>
            {trainer.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <h1 className="text-xl font-bold text-[#1a1a1a] mb-2">{trainer.name}</h1>
          <p className="text-[#8e8e93] text-sm">This page is coming soon.</p>
        </div>
      </div>
    );
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
  const supabase = getServiceClient();

  const { data: trainer } = await supabase
    .from('trainers')
    .select('name, bio')
    .eq('slug', slug)
    .single();

  if (!trainer) return { title: 'Not Found' };

  return {
    title: `${trainer.name} — Personalised Fitness Timeline`,
    description: trainer.bio || `Get your free personalised fitness timeline from ${trainer.name}`,
  };
}
