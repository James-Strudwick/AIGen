import { getServiceClient } from '@/lib/supabase';
import { Trainer, Package, TrainerForm } from '@/types';
import { notFound } from 'next/navigation';
import TrainerPage from '../../[slug]/TrainerPage';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EmbedPage({ params }: Props) {
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

  if (!trainer.active) {
    return (
      <div className="min-h-[400px] flex items-center justify-center px-5">
        <p className="text-[#8e8e93] text-sm text-center">This form is not accepting submissions right now.</p>
      </div>
    );
  }

  const { data: packages } = await supabase
    .from('packages')
    .select('*')
    .eq('trainer_id', trainer.id)
    .order('sort_order');

  const { data: forms } = await supabase
    .from('forms')
    .select('*')
    .eq('trainer_id', trainer.id)
    .eq('active', true);

  return (
    <TrainerPage
      trainer={trainer as Trainer}
      packages={(packages ?? []) as Package[]}
      forms={(forms ?? []) as TrainerForm[]}
      isEmbed
    />
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return {
    title: `${slug} — FomoForms embed`,
    robots: { index: false, follow: false },
  };
}
