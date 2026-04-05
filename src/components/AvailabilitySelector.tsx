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
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        How many days per week can you train?
      </h2>
      <p className="text-gray-400 text-center mb-8">
        Be realistic — consistency beats intensity
      </p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelected(day)}
            className="py-5 rounded-2xl text-center transition-all duration-200 hover:scale-[1.03] active:scale-95"
            style={{
              backgroundColor: selected === day ? primaryColor + '20' : 'rgba(255,255,255,0.03)',
              borderWidth: '2px',
              borderColor: selected === day ? primaryColor : 'rgba(255,255,255,0.1)',
            }}
          >
            <span className="text-3xl font-bold text-white block">{day}</span>
            <span className="text-gray-500 text-xs">{day === 1 ? 'day' : 'days'}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => selected && onSelect(selected)}
        disabled={!selected}
        className="w-full py-3.5 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-40"
        style={{ backgroundColor: primaryColor }}
      >
        Continue
      </button>
    </div>
  );
}
