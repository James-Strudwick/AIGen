'use client';

import { useState } from 'react';
import { GoalType, ExperienceLevel, TrainerBranding } from '@/types';

interface CustomAboutField {
  id: string;
  label: string;
  placeholder: string;
}

interface AboutYouFormProps {
  goalType: GoalType;
  branding: TrainerBranding;
  customFields?: CustomAboutField[];
  onSubmit: (data: {
    age: number | null;
    currentWeight: number | null;
    goalWeight: number | null;
    weightUnit: 'kg' | 'stone';
    experienceLevel: ExperienceLevel | null;
    customAboutFields: Record<string, string>;
  }) => void;
}

const experienceLevels: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: 'Beginner', desc: 'New to training' },
  { value: 'intermediate', label: 'Some Exp.', desc: '6+ months' },
  { value: 'advanced', label: 'Experienced', desc: '2+ years' },
];

export default function AboutYouForm({ goalType, branding, customFields = [], onSubmit }: AboutYouFormProps) {
  const [age, setAge] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'stone'>('kg');
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

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
      customAboutFields: customValues,
    });
  };

  const inputStyle = {
    backgroundColor: branding.color_card,
    borderWidth: '1px',
    borderColor: branding.color_border,
    color: branding.color_text,
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-[1.4rem] font-bold mb-1.5 text-center" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>
        A bit about you
      </h2>
      <p className="text-sm text-center mb-6" style={{ color: branding.color_text_muted }}>
        So we can personalise your timeline
      </p>

      <div className="space-y-4">
        {/* Age */}
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: branding.color_text }}>Age</label>
          <input type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25"
            className="w-full rounded-xl px-4 py-3 text-base focus:outline-none transition-colors" style={inputStyle} />
        </div>

        {/* Weight unit */}
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: branding.color_text }}>Weight unit</label>
          <div className="grid grid-cols-2 gap-2">
            {(['kg', 'stone'] as const).map((unit) => (
              <button key={unit} onClick={() => setWeightUnit(unit)}
                className="py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97]"
                style={{
                  backgroundColor: weightUnit === unit ? branding.color_primary : branding.color_card,
                  color: weightUnit === unit ? '#ffffff' : branding.color_text_muted,
                  borderWidth: '1px',
                  borderColor: weightUnit === unit ? branding.color_primary : branding.color_border,
                }}>
                {unit === 'kg' ? 'Kilograms' : 'Stone'}
              </button>
            ))}
          </div>
        </div>

        {/* Current weight */}
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: branding.color_text }}>Current weight ({weightUnit})</label>
          <input type="number" inputMode="decimal" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)}
            placeholder={weightUnit === 'kg' ? '80' : '12.5'}
            className="w-full rounded-xl px-4 py-3 text-base focus:outline-none transition-colors" style={inputStyle} />
        </div>

        {/* Goal weight */}
        {needsWeight && (
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: branding.color_text }}>Goal weight ({weightUnit})</label>
            <input type="number" inputMode="decimal" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)}
              placeholder={weightUnit === 'kg' ? '70' : '11'}
              className="w-full rounded-xl px-4 py-3 text-base focus:outline-none transition-colors" style={inputStyle} />
          </div>
        )}

        {/* Experience */}
        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: branding.color_text }}>Experience level</label>
          <div className="grid grid-cols-3 gap-2">
            {experienceLevels.map((level) => (
              <button key={level.value} onClick={() => setExperience(level.value)}
                className="py-3 px-2 rounded-xl text-center transition-all duration-200 active:scale-[0.97]"
                style={{
                  backgroundColor: experience === level.value ? branding.color_primary + '18' : branding.color_card,
                  borderWidth: '1.5px',
                  borderColor: experience === level.value ? branding.color_primary : branding.color_border,
                }}>
                <span className="text-xs font-semibold block" style={{ color: branding.color_text }}>{level.label}</span>
                <span className="text-[10px] block mt-0.5" style={{ color: branding.color_text_muted }}>{level.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom fields */}
        {customFields.map((field) => (
          <div key={field.id}>
            <label className="text-xs font-medium block mb-1.5" style={{ color: branding.color_text }}>{field.label}</label>
            <input
              type="text"
              value={customValues[field.id] || ''}
              onChange={(e) => setCustomValues({ ...customValues, [field.id]: e.target.value })}
              placeholder={field.placeholder}
              className="w-full rounded-xl px-4 py-3 text-base focus:outline-none transition-colors"
              style={inputStyle}
            />
          </div>
        ))}

        <button onClick={handleSubmit} disabled={!isValid}
          className="w-full py-3.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-40 active:scale-[0.97] text-sm text-white"
          style={{ backgroundColor: branding.color_primary }}>
          Continue
        </button>
      </div>
    </div>
  );
}
