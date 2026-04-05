'use client';

import { useState, useEffect, useRef } from 'react';
import { GoalType, ExperienceLevel, TimelineConfig } from '@/types';
import { calculateWithToggles, CalcInput } from '@/lib/calculateTimeline';

interface TimelineTogglesProps {
  baseInput: {
    goalType: GoalType;
    currentWeightKg: number | null;
    goalWeightKg: number | null;
    age: number | null;
    experienceLevel: ExperienceLevel;
    availableDays: number;
  };
  baseWeeks: number;
  primaryColor: string;
  trainerName: string;
}

export default function TimelineToggles({ baseInput, baseWeeks, primaryColor, trainerName }: TimelineTogglesProps) {
  const [config, setConfig] = useState<TimelineConfig>({
    sessionsPerWeek: baseInput.availableDays,
    hasNutritionSupport: false,
    hasOnlineCoaching: false,
  });

  const [displayWeeks, setDisplayWeeks] = useState(baseWeeks);
  const [animatingWeeks, setAnimatingWeeks] = useState(baseWeeks);
  const animRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  // Animate the weeks counter when config changes
  useEffect(() => {
    const calcInput: CalcInput = {
      goalType: baseInput.goalType,
      currentWeightKg: baseInput.currentWeightKg,
      goalWeightKg: baseInput.goalWeightKg,
      age: baseInput.age,
      experienceLevel: baseInput.experienceLevel,
      availableDays: baseInput.availableDays,
    };
    const target = calculateWithToggles(calcInput, config);
    setDisplayWeeks(target);

    // Animate from current to target
    const start = animatingWeeks;
    const diff = target - start;
    const duration = 600;
    const startTime = performance.now();

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatingWeeks(Math.round(start + diff * eased));

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, baseInput]);

  const weeksSaved = baseWeeks - displayWeeks;
  const percentFaster = baseWeeks > 0 ? Math.round((weeksSaved / baseWeeks) * 100) : 0;

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-white mb-2 text-center">
        Customise your plan
      </h3>
      <p className="text-gray-500 text-sm text-center mb-8">
        See how {trainerName} can accelerate your progress
      </p>

      {/* Animated weeks display */}
      <div className="text-center mb-8">
        <div
          className="inline-block rounded-2xl px-8 py-5 transition-all duration-500"
          style={{ backgroundColor: primaryColor + '15' }}
        >
          <p
            className="text-5xl font-bold transition-all duration-300"
            style={{ color: primaryColor }}
          >
            ~{animatingWeeks}
          </p>
          <p className="text-gray-400 text-sm mt-1">weeks to goal</p>
        </div>

        {weeksSaved > 0 && (
          <div
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-500"
            style={{ backgroundColor: primaryColor + '20', color: primaryColor }}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {weeksSaved} weeks faster ({percentFaster}% quicker)
          </div>
        )}
      </div>

      {/* Toggle controls */}
      <div className="space-y-4">
        {/* Sessions per week slider */}
        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-semibold text-sm">Sessions per week</p>
              <p className="text-gray-500 text-xs mt-0.5">More sessions = faster results</p>
            </div>
            <span
              className="text-2xl font-bold min-w-[2ch] text-right"
              style={{ color: primaryColor }}
            >
              {config.sessionsPerWeek}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-xs">1</span>
            <div className="flex-1 relative">
              <input
                type="range"
                min={1}
                max={6}
                step={1}
                value={config.sessionsPerWeek}
                onChange={(e) => setConfig({ ...config, sessionsPerWeek: parseInt(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${primaryColor} ${((config.sessionsPerWeek - 1) / 5) * 100}%, rgba(255,255,255,0.1) ${((config.sessionsPerWeek - 1) / 5) * 100}%)`,
                }}
              />
              {/* Tick marks */}
              <div className="flex justify-between mt-1.5 px-0.5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    onClick={() => setConfig({ ...config, sessionsPerWeek: n })}
                    className="w-6 h-6 rounded-full text-[10px] font-medium transition-all duration-200 active:scale-90"
                    style={{
                      backgroundColor: config.sessionsPerWeek >= n ? primaryColor + '30' : 'rgba(255,255,255,0.05)',
                      color: config.sessionsPerWeek >= n ? primaryColor : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-gray-600 text-xs">6</span>
          </div>
        </div>

        {/* Nutrition support toggle */}
        <ToggleCard
          title="Nutrition support"
          description="Personalised meal plans & macro tracking to accelerate results"
          impact={baseInput.goalType === 'weight_loss' ? 'Up to 25% faster' : baseInput.goalType === 'muscle_gain' ? 'Up to 20% faster' : 'Up to 15% faster'}
          enabled={config.hasNutritionSupport}
          onToggle={() => setConfig({ ...config, hasNutritionSupport: !config.hasNutritionSupport })}
          primaryColor={primaryColor}
        />

        {/* Online coaching toggle */}
        <ToggleCard
          title="Online coaching"
          description="Accountability check-ins, form reviews & programme adjustments between sessions"
          impact="Up to 10% faster"
          enabled={config.hasOnlineCoaching}
          onToggle={() => setConfig({ ...config, hasOnlineCoaching: !config.hasOnlineCoaching })}
          primaryColor={primaryColor}
        />
      </div>
    </div>
  );
}

function ToggleCard({
  title,
  description,
  impact,
  enabled,
  onToggle,
  primaryColor,
}: {
  title: string;
  description: string;
  impact: string;
  enabled: boolean;
  onToggle: () => void;
  primaryColor: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full text-left bg-white/[0.03] rounded-2xl p-5 border transition-all duration-300 active:scale-[0.98]"
      style={{
        borderColor: enabled ? primaryColor + '60' : 'rgba(255,255,255,0.05)',
        backgroundColor: enabled ? primaryColor + '08' : 'rgba(255,255,255,0.03)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{title}</p>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">{description}</p>
          <span
            className="inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: enabled ? primaryColor + '20' : 'rgba(255,255,255,0.05)',
              color: enabled ? primaryColor : 'rgba(255,255,255,0.3)',
            }}
          >
            {impact}
          </span>
        </div>

        {/* Toggle switch */}
        <div
          className="w-12 h-7 rounded-full p-0.5 flex-shrink-0 transition-all duration-300 mt-0.5"
          style={{
            backgroundColor: enabled ? primaryColor : 'rgba(255,255,255,0.1)',
          }}
        >
          <div
            className="w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300"
            style={{
              transform: enabled ? 'translateX(20px)' : 'translateX(0)',
            }}
          />
        </div>
      </div>
    </button>
  );
}
