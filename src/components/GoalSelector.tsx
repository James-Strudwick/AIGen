'use client';

import { useState } from 'react';
import { GoalType, TrainerBranding } from '@/types';

interface GoalSelectorProps {
  branding: TrainerBranding;
  onSelect: (goal: GoalType, performanceTarget?: string) => void;
}

const goals: { type: GoalType; emoji: string; label: string; sub: string }[] = [
  { type: 'weight_loss', emoji: '🔥', label: 'Lose Weight', sub: 'Burn fat & get lean' },
  { type: 'muscle_gain', emoji: '💪', label: 'Build Muscle', sub: 'Get stronger & bigger' },
  { type: 'fitness', emoji: '❤️', label: 'Improve Fitness', sub: 'Feel healthier & fitter' },
  { type: 'performance', emoji: '🏃', label: 'Performance', sub: 'Hit a specific target' },
];

const needsTarget: Record<GoalType, boolean> = {
  weight_loss: false,
  muscle_gain: false,
  fitness: true,
  performance: true,
};

const targetPrompts: Record<GoalType, { label: string; placeholder: string }> = {
  weight_loss: { label: '', placeholder: '' },
  muscle_gain: { label: '', placeholder: '' },
  fitness: {
    label: "What does 'fit' look like for you?",
    placeholder: "e.g. Run 5K without stopping, keep up with my kids, feel confident in the gym",
  },
  performance: {
    label: "What's your specific target?",
    placeholder: "e.g. Run a sub-25min 5K, bench press 100kg, complete a Hyrox",
  },
};

export default function GoalSelector({ branding, onSelect }: GoalSelectorProps) {
  const [selected, setSelected] = useState<GoalType | null>(null);
  const [target, setTarget] = useState('');
  const [showTargetInput, setShowTargetInput] = useState(false);

  const handleSelect = (type: GoalType) => {
    setSelected(type);
    if (needsTarget[type]) {
      setShowTargetInput(true);
      setTarget('');
    } else {
      setShowTargetInput(false);
      onSelect(type);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-[1.4rem] font-bold mb-1.5 text-center" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>
        What&apos;s your main goal?
      </h2>
      <p className="text-sm text-center mb-6" style={{ color: branding.color_text_muted }}>
        Select the goal that matters most
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        {goals.map((goal) => (
          <button
            key={goal.type}
            onClick={() => handleSelect(goal.type)}
            className="p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.97]"
            style={{
              borderColor: selected === goal.type ? branding.color_primary : branding.color_border,
              backgroundColor: selected === goal.type ? branding.color_primary + '12' : branding.color_card,
            }}
          >
            <span className="text-2xl block mb-1.5">{goal.emoji}</span>
            <span className="font-semibold block text-[13px] leading-tight" style={{ color: branding.color_text }}>{goal.label}</span>
            <span className="text-[11px]" style={{ color: branding.color_text_muted }}>{goal.sub}</span>
          </button>
        ))}
      </div>

      {showTargetInput && selected && needsTarget[selected] && (
        <div className="mt-5">
          <label className="text-sm block mb-2" style={{ color: branding.color_text }}>
            {targetPrompts[selected].label}
          </label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={targetPrompts[selected].placeholder}
            autoFocus
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
            style={{
              backgroundColor: branding.color_card,
              borderWidth: '1px',
              borderColor: branding.color_border,
              color: branding.color_text,
            }}
          />
          <button
            onClick={() => onSelect(selected, target)}
            disabled={!target.trim()}
            className="w-full mt-3 py-3.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-40 active:scale-[0.97] text-sm text-white"
            style={{ backgroundColor: branding.color_primary }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
