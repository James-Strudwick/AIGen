'use client';

import { useState } from 'react';
import { GoalType, ExperienceLevel } from '@/types';

interface AboutYouFormProps {
  goalType: GoalType;
  primaryColor: string;
  onSubmit: (data: {
    age: number;
    currentWeight: number;
    goalWeight: number | null;
    weightUnit: 'kg' | 'stone';
    experienceLevel: ExperienceLevel;
  }) => void;
}

const experienceLevels: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Beginner', desc: 'New to training' },
  { value: 'intermediate', label: 'Some Experience', desc: '6+ months training' },
  { value: 'advanced', label: 'Experienced', desc: '2+ years consistent' },
];

export default function AboutYouForm({ goalType, primaryColor, onSubmit }: AboutYouFormProps) {
  const [age, setAge] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'stone'>('kg');
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);

  const needsWeight = goalType === 'weight_loss' || goalType === 'muscle_gain';

  const toKg = (val: number) => weightUnit === 'stone' ? val * 6.35029 : val;

  const isValid = age && currentWeight && experience && (!needsWeight || goalWeight);

  const handleSubmit = () => {
    if (!isValid || !experience) return;
    onSubmit({
      age: parseInt(age),
      currentWeight: toKg(parseFloat(currentWeight)),
      goalWeight: goalWeight ? toKg(parseFloat(goalWeight)) : null,
      weightUnit,
      experienceLevel: experience,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Tell us about you
      </h2>
      <p className="text-gray-400 text-center mb-8">
        This helps us personalise your timeline
      </p>

      <div className="space-y-5">
        {/* Age */}
        <div>
          <label className="text-gray-300 text-sm block mb-1.5">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="25"
            min={16}
            max={80}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* Weight unit toggle */}
        <div>
          <label className="text-gray-300 text-sm block mb-1.5">Weight unit</label>
          <div className="flex gap-2">
            {(['kg', 'stone'] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => setWeightUnit(unit)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: weightUnit === unit ? primaryColor : 'rgba(255,255,255,0.05)',
                  color: weightUnit === unit ? 'white' : 'rgba(255,255,255,0.5)',
                  borderWidth: '1px',
                  borderColor: weightUnit === unit ? primaryColor : 'rgba(255,255,255,0.1)',
                }}
              >
                {unit === 'kg' ? 'Kilograms' : 'Stone'}
              </button>
            ))}
          </div>
        </div>

        {/* Current weight */}
        <div>
          <label className="text-gray-300 text-sm block mb-1.5">
            Current weight ({weightUnit})
          </label>
          <input
            type="number"
            value={currentWeight}
            onChange={(e) => setCurrentWeight(e.target.value)}
            placeholder={weightUnit === 'kg' ? '80' : '12.5'}
            step={weightUnit === 'stone' ? 0.5 : 1}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* Goal weight */}
        {needsWeight && (
          <div>
            <label className="text-gray-300 text-sm block mb-1.5">
              Goal weight ({weightUnit})
            </label>
            <input
              type="number"
              value={goalWeight}
              onChange={(e) => setGoalWeight(e.target.value)}
              placeholder={weightUnit === 'kg' ? '70' : '11'}
              step={weightUnit === 'stone' ? 0.5 : 1}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        )}

        {/* Experience */}
        <div>
          <label className="text-gray-300 text-sm block mb-2">Experience level</label>
          <div className="grid grid-cols-3 gap-2">
            {experienceLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setExperience(level.value)}
                className="p-3 rounded-xl text-center transition-all duration-200"
                style={{
                  backgroundColor: experience === level.value ? primaryColor + '20' : 'rgba(255,255,255,0.03)',
                  borderWidth: '1.5px',
                  borderColor: experience === level.value ? primaryColor : 'rgba(255,255,255,0.1)',
                }}
              >
                <span className="text-white text-xs font-semibold block">{level.label}</span>
                <span className="text-gray-500 text-[10px] block mt-0.5">{level.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full py-3.5 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-40 mt-2"
          style={{ backgroundColor: primaryColor }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
