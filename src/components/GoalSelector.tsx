'use client';

import { useState } from 'react';
import { GoalType, TrainerBranding, CustomGoal } from '@/types';

interface GoalSelectorProps {
  branding: TrainerBranding;
  customGoals?: CustomGoal[] | null;
  onSelect: (goal: GoalType, performanceTarget?: string) => void;
}

const defaultGoals: CustomGoal[] = [
  { id: 'weight_loss', emoji: '🔥', label: 'Lose Weight', subtitle: 'Burn fat & get lean', needs_target: false, target_prompt: '', target_placeholder: '', goal_type: 'weight_loss' },
  { id: 'muscle_gain', emoji: '💪', label: 'Build Muscle', subtitle: 'Get stronger & bigger', needs_target: false, target_prompt: '', target_placeholder: '', goal_type: 'muscle_gain' },
  { id: 'fitness', emoji: '❤️', label: 'Improve Fitness', subtitle: 'Feel healthier & fitter', needs_target: true, target_prompt: "What does 'fit' look like for you?", target_placeholder: 'e.g. Run 5K without stopping, keep up with my kids', goal_type: 'fitness' },
  { id: 'performance', emoji: '🏃', label: 'Performance', subtitle: 'Hit a specific target', needs_target: true, target_prompt: "What's your specific target?", target_placeholder: 'e.g. Run a sub-25min 5K, bench press 100kg', goal_type: 'performance' },
];

export default function GoalSelector({ branding, customGoals, onSelect }: GoalSelectorProps) {
  const goals = (customGoals && customGoals.length > 0) ? customGoals : defaultGoals;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [target, setTarget] = useState('');
  const [showTargetInput, setShowTargetInput] = useState(false);

  const selectedGoal = goals.find(g => g.id === selectedId);

  const handleSelect = (goal: CustomGoal) => {
    setSelectedId(goal.id);
    if (goal.needs_target) {
      setShowTargetInput(true);
      setTarget('');
    } else {
      setShowTargetInput(false);
      onSelect(goal.goal_type);
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

      <div className={`grid gap-2.5 ${goals.length <= 4 ? 'grid-cols-2' : goals.length <= 6 ? 'grid-cols-2' : 'grid-cols-2'}`}>
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => handleSelect(goal)}
            className="p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.97]"
            style={{
              borderColor: selectedId === goal.id ? branding.color_primary : branding.color_border,
              backgroundColor: selectedId === goal.id ? branding.color_primary + '12' : branding.color_card,
            }}
          >
            <span className="text-2xl block mb-1.5">{goal.emoji}</span>
            <span className="font-semibold block text-[13px] leading-tight" style={{ color: branding.color_text }}>{goal.label}</span>
            <span className="text-[11px]" style={{ color: branding.color_text_muted }}>{goal.subtitle}</span>
          </button>
        ))}
      </div>

      {showTargetInput && selectedGoal?.needs_target && (
        <div className="mt-5">
          <label className="text-sm block mb-2" style={{ color: branding.color_text }}>
            {selectedGoal.target_prompt || "What's your specific target?"}
          </label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={selectedGoal.target_placeholder || 'Describe your target...'}
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
            onClick={() => onSelect(selectedGoal.goal_type, target)}
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
