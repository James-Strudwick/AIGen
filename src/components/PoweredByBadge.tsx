'use client';

import { TrainerBranding } from '@/types';

interface PoweredByBadgeProps {
  branding: TrainerBranding;
}

export default function PoweredByBadge({ branding }: PoweredByBadgeProps) {
  return (
    <div className="text-center py-6">
      <a
        href="https://fomoforms.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[11px] transition-opacity hover:opacity-80"
        style={{ color: branding.color_text_muted }}
      >
        Powered by
        <span className="font-semibold" style={{ color: branding.color_text }}>FomoForms</span>
      </a>
    </div>
  );
}
