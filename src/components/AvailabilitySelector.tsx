'use client';

import { useState } from 'react';
import { TrainerBranding } from '@/types';

interface AvailabilitySelectorProps {
  branding: TrainerBranding;
  onSelect: (days: number) => void;
}

export default function AvailabilitySelector({ branding, onSelect }: AvailabilitySelectorProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const days = [1, 2, 3, 4, 5, 6];

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-[1.4rem] font-bold mb-1.5 text-center" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>
        How many days can you train?
      </h2>
      <p className="text-sm text-center mb-6" style={{ color: branding.color_text_muted }}>
        Be realistic — consistency beats intensity
      </p>

      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelected(day)}
            className="py-5 rounded-2xl text-center transition-all duration-200 active:scale-[0.95]"
            style={{
              backgroundColor: selected === day ? branding.color_primary + '18' : branding.color_card,
              borderWidth: '2px',
              borderColor: selected === day ? branding.color_primary : branding.color_border,
            }}
          >
            <span className="text-2xl font-bold block" style={{ color: branding.color_text }}>{day}</span>
            <span className="text-[11px]" style={{ color: branding.color_text_muted }}>{day === 1 ? 'day/wk' : 'days/wk'}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => selected && onSelect(selected)}
        disabled={!selected}
        className="w-full py-3.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-40 active:scale-[0.97] text-sm text-white"
        style={{ backgroundColor: branding.color_primary }}
      >
        Continue
      </button>
    </div>
  );
}
