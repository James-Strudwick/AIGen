'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/auth';
import { Trainer, Package } from '@/types';
import TrainerPage from '../../[slug]/TrainerPage';
import Link from 'next/link';

export default function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    const load = async () => {
      const { slug } = await params;
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      // Load trainer via API (which verifies ownership)
      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();

      // Check the slug matches the authenticated trainer
      if (data.trainer.slug !== slug) {
        setLoading(false);
        return;
      }

      setTrainer(data.trainer as Trainer);
      setPackages((data.packages || []) as Package[]);
      setAuthorized(true);
      setLoading(false);
    };
    load();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-white flex items-center justify-center">
        <p className="text-[#8e8e93] text-sm">Loading preview...</p>
      </div>
    );
  }

  if (!authorized || !trainer) {
    return (
      <div className="min-h-[100dvh] bg-white flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold mb-2">Preview not available</h1>
          <p className="text-[#8e8e93] text-sm mb-6">You need to be logged in as the page owner to preview.</p>
          <Link href="/login" className="bg-[#1a1a1a] text-white px-6 py-2.5 rounded-xl text-sm font-medium">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Preview banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a] text-white text-center py-2 text-xs font-medium flex items-center justify-center gap-3">
        <span>Preview mode — only you can see this</span>
        <Link href="/settings" className="underline underline-offset-2 opacity-70 hover:opacity-100">
          Back to settings
        </Link>
      </div>
      <div className="pt-8">
        <TrainerPage trainer={trainer} packages={packages} isPreview />
      </div>
    </>
  );
}
