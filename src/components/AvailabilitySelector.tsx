'use client';

import { useState } from 'react';

interface AvailabilitySelectorProps {
  primaryColor: string;
  onSelect: (days: number) => void;
}

export default function AvailabilitySelector({ primaryColor, onSelect }: AvailabilitySelectorProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const days = [1, 2, 3, 4, 5, 6];

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-[1.4rem] font-bold text-white mb-1.5 text-center">
        How many days can you train?
      </h2>
      <p className="text-gray-400 text-sm text-center mb-6">
        Be realistic — consistency beats intensity
      </p>

      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelected(day)}
            className="py-5 rounded-2xl text-center transition-all duration-200 active:scale-[0.95]"
            style={{
              backgroundColor: selected === day ? primaryColor + '18' : 'rgba(255,255,255,0.03)',
              borderWidth: '2px',
              borderColor: selected === day ? primaryColor : 'rgba(255,255,255,0.08)',
            }}
          >
            <span className="text-2xl font-bold text-white block">{day}</span>
            <span className="text-gray-500 text-[11px]">{day === 1 ? 'day/wk' : 'days/wk'}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => selected && onSelect(selected)}
        disabled={!selected}
        className="w-full py-3.5 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-40 active:scale-[0.97] text-sm"
        style={{ backgroundColor: primaryColor }}
      >
        Continue
      </button>
    </div>
  );
}
