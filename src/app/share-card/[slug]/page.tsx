'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@/lib/auth';
import { Trainer } from '@/types';
import { resolveBranding } from '@/lib/branding';
import Link from 'next/link';

const CARD_STYLES = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'bold', label: 'Bold' },
  { id: 'gradient', label: 'Gradient' },
];

const CARD_MESSAGES = [
  "Want to know how long it'll take to reach your goal?",
  "How many weeks until you hit your target?",
  "Find out your personalised timeline for free",
  "I built a free calculator — try it 👇",
  "See how fast you could reach your goal with me",
];

export default function ShareCardPage({ params }: { params: Promise<{ slug: string }> }) {
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [style, setStyle] = useState('minimal');
  const [messageIdx, setMessageIdx] = useState(0);
  const [customMessage, setCustomMessage] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { slug } = await params;
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) { setLoading(false); return; }

      const data = await res.json();
      if (data.trainer.slug !== slug) { setLoading(false); return; }
      setTrainer(data.trainer as Trainer);
      setLoading(false);
    };
    load();
  }, [params]);

  if (loading) {
    return <div className="min-h-[100dvh] bg-white flex items-center justify-center"><p className="text-[#8e8e93] text-sm">Loading...</p></div>;
  }

  if (!trainer) {
    return <div className="min-h-[100dvh] bg-white flex items-center justify-center"><p className="text-[#8e8e93] text-sm">Not available</p></div>;
  }

  const branding = resolveBranding(trainer);
  const message = customMessage || CARD_MESSAGES[messageIdx];
  const link = `fomoforms.com/${trainer.slug}`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `${trainer.slug}-share-card.png`;
      a.click();
    } catch {
      alert('Screenshot failed — try taking a screenshot manually instead');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Share card</h1>
            <p className="text-[#8e8e93] text-sm">Post this to your Instagram story</p>
          </div>
          <Link href="/dashboard" className="text-[#8e8e93] text-xs px-3 py-1.5 rounded-lg bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-colors">
            Dashboard
          </Link>
        </div>

        {/* Style selector */}
        <div className="flex gap-2 mb-4">
          {CARD_STYLES.map((s) => (
            <button key={s.id} onClick={() => setStyle(s.id)}
              className="text-xs px-3 py-1.5 rounded-full transition-all"
              style={{
                backgroundColor: style === s.id ? '#1a1a1a' : '#f5f5f7',
                color: style === s.id ? '#fff' : '#8e8e93',
              }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Message selector */}
        <div className="mb-4">
          <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4">
            {CARD_MESSAGES.map((msg, i) => (
              <button key={i} onClick={() => { setMessageIdx(i); setCustomMessage(''); }}
                className="text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  backgroundColor: messageIdx === i && !customMessage ? '#f5f5f7' : 'transparent',
                  color: messageIdx === i && !customMessage ? '#1a1a1a' : '#8e8e93',
                  borderWidth: '1px',
                  borderColor: messageIdx === i && !customMessage ? '#e5e5ea' : 'transparent',
                }}>
                {msg.length > 35 ? msg.slice(0, 35) + '...' : msg}
              </button>
            ))}
          </div>
          <input
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Or write your own message..."
            className="w-full mt-2 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-4 py-2.5 text-sm text-[#1a1a1a] placeholder-[#8e8e93] focus:outline-none focus:border-[#8e8e93]"
          />
        </div>

        {/* Card preview */}
        <div ref={cardRef} className="rounded-3xl overflow-hidden" style={{ aspectRatio: '9/16' }}>
          {style === 'minimal' && (
            <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center"
              style={{ backgroundColor: branding.color_background }}>
              {trainer.photo_url ? (
                <div className="w-20 h-20 rounded-full mb-5 border-[3px] bg-cover bg-center"
                  style={{ borderColor: branding.color_primary, backgroundImage: `url(${trainer.photo_url})` }} />
              ) : (
                <div className="w-20 h-20 rounded-full mb-5 border-[3px] flex items-center justify-center text-xl font-bold"
                  style={{ borderColor: branding.color_primary, backgroundColor: branding.color_primary + '20', color: branding.color_text }}>
                  {trainer.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <p className="text-2xl font-bold leading-tight mb-4" style={{ color: branding.color_text }}>
                {message}
              </p>
              <p className="text-sm mb-8" style={{ color: branding.color_text_muted }}>
                Free personalised timeline in 60 seconds
              </p>
              <div className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm text-center"
                style={{ backgroundColor: branding.color_primary }}>
                Try it free
              </div>
              <p className="text-xs mt-4 font-medium" style={{ color: branding.color_text_muted }}>
                {link}
              </p>
            </div>
          )}

          {style === 'bold' && (
            <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center"
              style={{ backgroundColor: branding.color_primary }}>
              {trainer.photo_url ? (
                <div className="w-20 h-20 rounded-full mb-5 border-[3px] border-white/30 bg-cover bg-center"
                  style={{ backgroundImage: `url(${trainer.photo_url})` }} />
              ) : (
                <div className="w-20 h-20 rounded-full mb-5 border-[3px] border-white/30 flex items-center justify-center text-xl font-bold text-white bg-white/10">
                  {trainer.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <p className="text-2xl font-bold leading-tight mb-4 text-white">
                {message}
              </p>
              <p className="text-sm mb-8 text-white/70">
                Free personalised timeline in 60 seconds
              </p>
              <div className="w-full py-3.5 rounded-2xl bg-white font-semibold text-sm text-center"
                style={{ color: branding.color_primary }}>
                Try it free
              </div>
              <p className="text-xs mt-4 font-medium text-white/50">
                {link}
              </p>
            </div>
          )}

          {style === 'gradient' && (
            <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center"
              style={{ background: `linear-gradient(135deg, ${branding.color_primary}, ${branding.color_primary}88, ${branding.color_background})` }}>
              {trainer.photo_url ? (
                <div className="w-20 h-20 rounded-full mb-5 border-[3px] border-white/40 bg-cover bg-center"
                  style={{ backgroundImage: `url(${trainer.photo_url})` }} />
              ) : (
                <div className="w-20 h-20 rounded-full mb-5 border-[3px] border-white/40 flex items-center justify-center text-xl font-bold text-white bg-white/10">
                  {trainer.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <p className="text-2xl font-bold leading-tight mb-4 text-white drop-shadow-sm">
                {message}
              </p>
              <p className="text-sm mb-8 text-white/70">
                Free personalised timeline in 60 seconds
              </p>
              <div className="w-full py-3.5 rounded-2xl bg-white font-semibold text-sm text-center"
                style={{ color: branding.color_primary }}>
                Try it free
              </div>
              <p className="text-xs mt-4 font-medium text-white/50">
                {link}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button onClick={handleDownload}
            className="flex-1 py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm transition-all active:scale-[0.97]">
            Download image
          </button>
        </div>

        <p className="text-[#8e8e93] text-[11px] text-center mt-3">
          Screenshot or download, then post to your Instagram story with a link sticker to {link}
        </p>
      </div>
    </div>
  );
}
