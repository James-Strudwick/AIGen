import { getServiceClient } from '@/lib/supabase';
import { Trainer, Package } from '@/types';
import { notFound } from 'next/navigation';
import TrainerPage from '../../[slug]/TrainerPage';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PreviewPage({ params }: Props) {
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

  const { data: packages } = await supabase
    .from('packages')
    .select('*')
    .eq('trainer_id', trainer.id)
    .order('sort_order');

  return (
    <>
      {/* Preview banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a] text-white text-center py-2 text-xs font-medium">
        Preview mode — this is how prospects will see your page
      </div>
      <div className="pt-8">
        <TrainerPage
          trainer={trainer as Trainer}
          packages={(packages ?? []) as Package[]}
        />
      </div>
    </>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: `Preview — ${slug}` };
}
