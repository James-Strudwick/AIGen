'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@/lib/auth';
import { Trainer, CustomGoal } from '@/types';
import { resolveBranding } from '@/lib/branding';
import Link from 'next/link';

const CARD_STYLES = [
  { id: 'minimal', label: 'Minimal' },
  { id: 'bold', label: 'Bold' },
  { id: 'gradient', label: 'Gradient' },
];

type Ratio = '9:16' | '4:5' | '1:1';
const RATIOS: { id: Ratio; label: string; sub: string }[] = [
  { id: '9:16', label: 'Story', sub: '9:16' },
  { id: '4:5', label: 'Portrait', sub: '4:5' },
  { id: '1:1', label: 'Square', sub: '1:1' },
];

const CARD_MESSAGES = [
  "Want to know how long it'll take to reach your goal?",
  "How many weeks until you hit your target?",
  "Find out your personalised timeline for free",
  "I built a free calculator — try it 👇",
  "See how fast you could reach your goal with me",
];

const DEFAULT_GOALS: CustomGoal[] = [
  { id: 'weight_loss', emoji: '🔥', label: 'Lose Weight', subtitle: '', needs_target: false, target_prompt: '', target_placeholder: '', goal_type: 'weight_loss' },
  { id: 'muscle_gain', emoji: '💪', label: 'Build Muscle', subtitle: '', needs_target: false, target_prompt: '', target_placeholder: '', goal_type: 'muscle_gain' },
  { id: 'fitness', emoji: '❤️', label: 'Improve Fitness', subtitle: '', needs_target: false, target_prompt: '', target_placeholder: '', goal_type: 'fitness' },
  { id: 'performance', emoji: '🏃', label: 'Performance', subtitle: '', needs_target: false, target_prompt: '', target_placeholder: '', goal_type: 'performance' },
];

const DEFAULT_SUBTEXT = 'Free personalised timeline in 60 seconds';
const DEFAULT_CTA = 'Try it free';

function goalMessage(goal: CustomGoal): string {
  switch (goal.goal_type) {
    case 'weight_loss': return 'How long will it take you to lose the weight?';
    case 'muscle_gain': return 'How long until you actually build muscle?';
    case 'fitness': return 'How long to get in the best shape of your life?';
    case 'performance': return 'How long to hit your next performance goal?';
    default: return `How long will it take to ${goal.label.toLowerCase()}?`;
  }
}

export default function ShareCardPage() {
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [style, setStyle] = useState('minimal');
  const [ratio, setRatio] = useState<Ratio>('9:16');
  const [messageIdx, setMessageIdx] = useState(0);
  const [customMessage, setCustomMessage] = useState('');
  const [customSubtext, setCustomSubtext] = useState('');
  const [customCta, setCustomCta] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const res = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) { setLoading(false); return; }

      const data = await res.json();
      setTrainer(data.trainer as Trainer);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="min-h-[100dvh] bg-white flex items-center justify-center"><p className="text-[#8e8e93] text-sm">Loading...</p></div>;
  }

  if (!trainer) {
    return <div className="min-h-[100dvh] bg-white flex items-center justify-center"><p className="text-[#8e8e93] text-sm">Not available</p></div>;
  }

  const branding = resolveBranding(trainer);
  const goals: CustomGoal[] = trainer.custom_goals?.length ? trainer.custom_goals : DEFAULT_GOALS;
  const selectedGoal = goals.find((g) => g.id === selectedGoalId) || null;
  const message = selectedGoal
    ? goalMessage(selectedGoal)
    : (customMessage || CARD_MESSAGES[messageIdx] || CARD_MESSAGES[0]);
  const subtext = customSubtext || DEFAULT_SUBTEXT;
  const cta = customCta || DEFAULT_CTA;
  const link = `fomoforms.com/${trainer.slug}`;
  const aspect = ratio === '1:1' ? '1 / 1' : ratio === '4:5' ? '4 / 5' : '9 / 16';
  const previewMaxWidth = ratio === '9:16' ? '100%' : ratio === '4:5' ? '360px' : '340px';

  const selectGoal = (goal: CustomGoal | null) => {
    setSelectedGoalId(goal?.id || null);
    if (goal) {
      setCustomMessage('');
      setMessageIdx(-1);
    } else if (messageIdx < 0) {
      setMessageIdx(0);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const params = new URLSearchParams({
        slug: trainer.slug,
        style,
        ratio,
        message,
        subtext,
        cta,
      });
      const res = await fetch(`/api/share-image?${params}`);
      if (!res.ok) throw new Error('Failed to generate');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileSuffix = selectedGoal ? selectedGoal.id : 'share-card';
      a.download = `${trainer.slug}-${fileSuffix}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Download failed — try taking a screenshot of the card instead (hold power + volume up on iPhone)');
    } finally {
      setDownloading(false);
    }
  };

  const labelClass = "text-[#8e8e93] text-[10px] font-semibold uppercase tracking-wider mb-1.5";
  const inputClass = "w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-4 py-2.5 text-sm text-[#1a1a1a] placeholder-[#8e8e93] focus:outline-none focus:border-[#8e8e93]";

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

        {/* Style */}
        <div className="mb-3">
          <p className={labelClass}>Style</p>
          <div className="flex gap-2">
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
        </div>

        {/* Size / aspect ratio */}
        <div className="mb-3">
          <p className={labelClass}>Size</p>
          <div className="flex gap-2">
            {RATIOS.map((r) => (
              <button key={r.id} onClick={() => setRatio(r.id)}
                className="text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5"
                style={{
                  backgroundColor: ratio === r.id ? '#1a1a1a' : '#f5f5f7',
                  color: ratio === r.id ? '#fff' : '#8e8e93',
                }}>
                <span>{r.label}</span>
                <span className="text-[9px] opacity-60">{r.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Goal-specific cards */}
        <div className="mb-3">
          <p className={labelClass}>Quick card per goal</p>
          <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4">
            <button onClick={() => selectGoal(null)}
              className="text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-all"
              style={{
                backgroundColor: !selectedGoalId ? '#1a1a1a' : '#f5f5f7',
                color: !selectedGoalId ? '#fff' : '#8e8e93',
              }}>
              General
            </button>
            {goals.map((g) => (
              <button key={g.id} onClick={() => selectGoal(g)}
                className="text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 transition-all flex items-center gap-1"
                style={{
                  backgroundColor: selectedGoalId === g.id ? '#1a1a1a' : '#f5f5f7',
                  color: selectedGoalId === g.id ? '#fff' : '#8e8e93',
                }}>
                <span>{g.emoji}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message (only when no goal selected) */}
        {!selectedGoalId && (
          <div className="mb-3">
            <p className={labelClass}>Message</p>
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
              className={`mt-2 ${inputClass}`}
            />
          </div>
        )}

        {/* Subtext */}
        <div className="mb-3">
          <p className={labelClass}>Subtext</p>
          <input
            value={customSubtext}
            onChange={(e) => setCustomSubtext(e.target.value)}
            placeholder={DEFAULT_SUBTEXT}
            className={inputClass}
          />
        </div>

        {/* CTA */}
        <div className="mb-4">
          <p className={labelClass}>CTA button</p>
          <input
            value={customCta}
            onChange={(e) => setCustomCta(e.target.value)}
            placeholder={DEFAULT_CTA}
            className={inputClass}
          />
        </div>

        {/* Card preview */}
        <div ref={cardRef} className="rounded-3xl overflow-hidden mx-auto" style={{ aspectRatio: aspect, maxWidth: previewMaxWidth }}>
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
                {subtext}
              </p>
              <div className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm text-center"
                style={{ backgroundColor: branding.color_primary }}>
                {cta}
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
                {subtext}
              </p>
              <div className="w-full py-3.5 rounded-2xl bg-white font-semibold text-sm text-center"
                style={{ color: branding.color_primary }}>
                {cta}
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
                {subtext}
              </p>
              <div className="w-full py-3.5 rounded-2xl bg-white font-semibold text-sm text-center"
                style={{ color: branding.color_primary }}>
                {cta}
              </div>
              <p className="text-xs mt-4 font-medium text-white/50">
                {link}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button onClick={handleDownload} disabled={downloading}
            className="flex-1 py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-40">
            {downloading ? 'Generating...' : selectedGoal ? `Download ${selectedGoal.label} card` : 'Download image'}
          </button>
        </div>

        <p className="text-[#8e8e93] text-[11px] text-center mt-3">
          Screenshot or download, then post to your Instagram story with a link sticker to {link}
        </p>
      </div>
    </div>
  );
}
