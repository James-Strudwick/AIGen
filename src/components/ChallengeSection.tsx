'use client';

import { useState } from 'react';
import { Package, TrainerBranding } from '@/types';
import { currencySymbol } from '@/lib/currency';

interface ChallengeSectionProps {
  packages: Package[];
  branding: TrainerBranding;
  currency?: string;
  leadId: string | null;
  primaryCtaHref: string | null;
  isPreview?: boolean;
}

function formatStartDate(iso: string | null): string {
  if (!iso) return 'Rolling start — join anytime';
  try {
    return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return iso;
  }
}

export default function ChallengeSection({
  packages,
  branding,
  currency,
  leadId,
  primaryCtaHref,
  isPreview = false,
}: ChallengeSectionProps) {
  const sym = currencySymbol(currency);
  const [joining, setJoining] = useState<string | null>(null);
  // Local spots override so the card updates instantly after click
  const [localSpots, setLocalSpots] = useState<Record<string, number>>({});

  const challenges = packages.filter(p => p.is_challenge);
  if (challenges.length === 0) return null;

  const handleJoin = async (pkg: Package) => {
    if (isPreview) return;
    setJoining(pkg.id);
    try {
      const res = await fetch('/api/select-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id, leadId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.spotsRemaining === 'number') {
          setLocalSpots(prev => ({ ...prev, [pkg.id]: data.spotsRemaining }));
        }
      }
    } catch {
      // Still let them through — we don't want to block the CTA if the
      // decrement request fails.
    } finally {
      setJoining(null);
      if (primaryCtaHref && typeof window !== 'undefined') {
        window.open(primaryCtaHref, '_blank', 'noopener,noreferrer');
      }
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold text-center"
        style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>
        Join a challenge
      </h3>
      <p className="text-sm text-center mb-5" style={{ color: branding.color_text_muted }}>
        Time-bound programmes with a fixed start date and outcome
      </p>

      {challenges.map((pkg) => {
        const remaining = localSpots[pkg.id] ?? pkg.challenge_spots_remaining ?? null;
        const total = pkg.challenge_spots_total;
        const isFull = remaining != null && remaining <= 0;
        const isLow = remaining != null && remaining <= 5 && remaining > 0;

        return (
          <div key={pkg.id} className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              backgroundColor: branding.color_primary + '12',
              borderWidth: '1.5px',
              borderColor: branding.color_primary,
            }}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0 flex-1">
                <span className="inline-block text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded-full mb-2"
                  style={{ backgroundColor: branding.color_primary, color: '#ffffff' }}>
                  Challenge
                </span>
                <h4 className="text-lg font-bold leading-tight"
                  style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>
                  {pkg.name}
                </h4>
                {pkg.challenge_outcome && (
                  <p className="text-sm mt-1 leading-snug" style={{ color: branding.color_text_muted }}>
                    {pkg.challenge_outcome}
                  </p>
                )}
              </div>
              {pkg.monthly_price != null && (
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-bold" style={{ color: branding.color_primary }}>
                    {sym}{pkg.monthly_price}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="rounded-lg p-2.5" style={{ backgroundColor: branding.color_card }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: branding.color_text_muted }}>Duration</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: branding.color_text }}>
                  {pkg.challenge_duration_weeks ? `${pkg.challenge_duration_weeks} weeks` : '—'}
                </p>
              </div>
              <div className="rounded-lg p-2.5" style={{ backgroundColor: branding.color_card }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: branding.color_text_muted }}>Starts</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: branding.color_text }}>
                  {formatStartDate(pkg.challenge_start_date)}
                </p>
              </div>
            </div>

            {remaining != null && total != null && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span style={{ color: branding.color_text_muted }}>
                    {isFull ? 'Full — waitlist only' : `${remaining} of ${total} spots left`}
                  </span>
                  {isLow && (
                    <span className="text-[10px] font-bold" style={{ color: '#FF9500' }}>FILLING FAST</span>
                  )}
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: branding.color_border }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${total > 0 ? (remaining / total) * 100 : 0}%`,
                      backgroundColor: isFull ? '#8e8e93' : isLow ? '#FF9500' : branding.color_primary,
                    }} />
                </div>
              </div>
            )}

            <button onClick={() => handleJoin(pkg)} disabled={isFull || joining === pkg.id}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: branding.color_primary }}>
              {isFull ? 'Join waitlist' : joining === pkg.id ? 'Opening...' : 'Join this challenge'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
