'use client';

import { TrainerBranding, Tier } from '@/types';

interface PoweredByBadgeProps {
  branding: TrainerBranding;
  tier?: Tier;
}

export default function PoweredByBadge({ branding, tier = 'starter' }: PoweredByBadgeProps) {
  if (tier === 'pro') return null;

  return (
    <div className="text-center py-6">
      <a
        href="https://fomoforms.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105 active:scale-95"
        style={{
          backgroundColor: branding.color_card,
          borderWidth: '1px',
          borderColor: branding.color_border,
          color: branding.color_text_muted,
        }}
      >
        <svg className="w-4 h-4" style={{ color: branding.color_primary }} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
        Powered by
        <span className="font-bold" style={{ color: branding.color_text }}>FomoForms</span>
      </a>
    </div>
  );
}
