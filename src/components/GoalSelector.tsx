'use client';

import { useState } from 'react';
import { GoalType } from '@/types';

interface GoalSelectorProps {
  primaryColor: string;
  onSelect: (goal: GoalType, performanceTarget?: string) => void;
}

const goals: { type: GoalType; emoji: string; label: string; sub: string }[] = [
  { type: 'weight_loss', emoji: '🔥', label: 'Lose Weight', sub: 'Burn fat and get lean' },
  { type: 'muscle_gain', emoji: '💪', label: 'Build Muscle', sub: 'Get stronger and bigger' },
  { type: 'fitness', emoji: '❤️', label: 'Improve Fitness', sub: 'Feel healthier and fitter' },
  { type: 'performance', emoji: '🏃', label: 'Performance Goal', sub: 'Hit a specific target' },
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
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        What&apos;s your main goal?
      </h2>
      <p className="text-gray-400 text-center mb-8">
        Select the goal that matters most to you
      </p>

      <div className="grid grid-cols-2 gap-3">
        {goals.map((goal) => (
          <button
            key={goal.type}
            onClick={() => handleSelect(goal.type)}
            className="p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.02] active:scale-95"
            style={{
              borderColor: selected === goal.type ? primaryColor : 'rgba(255,255,255,0.1)',
              backgroundColor: selected === goal.type ? primaryColor + '15' : 'rgba(255,255,255,0.03)',
            }}
          >
            <span className="text-3xl block mb-2">{goal.emoji}</span>
            <span className="text-white font-semibold block text-sm">{goal.label}</span>
            <span className="text-gray-500 text-xs">{goal.sub}</span>
          </button>
        ))}
      </div>

      {showPerformanceInput && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <label className="text-gray-300 text-sm block mb-2">
            What&apos;s your specific target?
          </label>
          <input
            type="text"
            value={performanceTarget}
            onChange={(e) => setPerformanceTarget(e.target.value)}
            placeholder="e.g. Run a 5K, bench press 100kg"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
          />
          <button
            onClick={() => onSelect('performance', performanceTarget)}
            disabled={!performanceTarget.trim()}
            className="w-full mt-4 py-3 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-40"
            style={{ backgroundColor: primaryColor }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
