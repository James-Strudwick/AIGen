'use client';

import { useState } from 'react';
import { GoalType } from '@/types';

interface GoalSelectorProps {
  primaryColor: string;
  onSelect: (goal: GoalType, performanceTarget?: string) => void;
}

const goals: { type: GoalType; emoji: string; label: string; sub: string }[] = [
  { type: 'weight_loss', emoji: '🔥', label: 'Lose Weight', sub: 'Burn fat & get lean' },
  { type: 'muscle_gain', emoji: '💪', label: 'Build Muscle', sub: 'Get stronger & bigger' },
  { type: 'fitness', emoji: '❤️', label: 'Improve Fitness', sub: 'Feel healthier & fitter' },
  { type: 'performance', emoji: '🏃', label: 'Performance', sub: 'Hit a specific target' },
];

export default function GoalSelector({ primaryColor, onSelect }: GoalSelectorProps) {
  const [selected, setSelected] = useState<GoalType | null>(null);
  const [performanceTarget, setPerformanceTarget] = useState('');
  const [showPerformanceInput, setShowPerformanceInput] = useState(false);

  const handleSelect = (type: GoalType) => {
    setSelected(type);
    if (type === 'performance') {
      setShowPerformanceInput(true);
    } else {
      setShowPerformanceInput(false);
      onSelect(type);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-[1.4rem] font-bold text-white mb-1.5 text-center">
        What&apos;s your main goal?
      </h2>
      <p className="text-gray-400 text-sm text-center mb-6">
        Select the goal that matters most
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        {goals.map((goal) => (
          <button
            key={goal.type}
            onClick={() => handleSelect(goal.type)}
            className="p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.97]"
            style={{
              borderColor: selected === goal.type ? primaryColor : 'rgba(255,255,255,0.08)',
              backgroundColor: selected === goal.type ? primaryColor + '12' : 'rgba(255,255,255,0.02)',
            }}
          >
            <span className="text-2xl block mb-1.5">{goal.emoji}</span>
            <span className="text-white font-semibold block text-[13px] leading-tight">{goal.label}</span>
            <span className="text-gray-500 text-[11px]">{goal.sub}</span>
          </button>
        ))}
      </div>

      {showPerformanceInput && (
        <div className="mt-5">
          <label className="text-gray-300 text-sm block mb-2">
            What&apos;s your specific target?
          </label>
          <input
            type="text"
            value={performanceTarget}
            onChange={(e) => setPerformanceTarget(e.target.value)}
            placeholder="e.g. Run a 5K, bench press 100kg"
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors text-sm"
          />
          <button
            onClick={() => onSelect('performance', performanceTarget)}
            disabled={!performanceTarget.trim()}
            className="w-full mt-3 py-3.5 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-40 active:scale-[0.97] text-sm"
            style={{ backgroundColor: primaryColor }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
