'use client';

import { useState, useEffect, useRef } from 'react';
import { GoalType, ExperienceLevel, TimelineConfig, TrainerBranding, TrainerServices, Package } from '@/types';
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
  branding: TrainerBranding;
  services: TrainerServices;
  packages: Package[];
  trainerName: string;
}

export default function TimelineToggles({ baseInput, baseWeeks, branding, services, packages, trainerName }: TimelineTogglesProps) {
  const [config, setConfig] = useState<TimelineConfig>({
    sessionsPerWeek: baseInput.availableDays,
    hasNutritionSupport: false,
    hasOnlineCoaching: false,
  });

  const [displayWeeks, setDisplayWeeks] = useState(baseWeeks);
  const [animatingWeeks, setAnimatingWeeks] = useState(baseWeeks);
  const animRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

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

    const start = animatingWeeks;
    const diff = target - start;
    const duration = 600;
    const startTime = performance.now();

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatingWeeks(Math.round(start + diff * eased));
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, baseInput]);

  const weeksSaved = baseWeeks - displayWeeks;
  const percentFaster = baseWeeks > 0 ? Math.round((weeksSaved / baseWeeks) * 100) : 0;

  // Find the package that matches current session count (closest match)
  const sortedPkgs = [...packages].filter(p => !p.is_online).sort((a, b) => a.sessions_per_week - b.sessions_per_week);
  const matchedPkg = sortedPkgs.find(p => p.sessions_per_week >= config.sessionsPerWeek)
    || sortedPkgs[sortedPkgs.length - 1]
    || null;

  // Calculate estimated total cost for matched package
  const months = displayWeeks / 4.33;
  const totalCost = matchedPkg?.monthly_price ? Math.round(matchedPkg.monthly_price * months) : null;

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-2 text-center" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>
        Customise your plan
      </h3>
      <p className="text-sm text-center mb-8" style={{ color: branding.color_text_muted }}>
        See how {trainerName} can accelerate your progress
      </p>

      {/* Animated weeks display */}
      <div className="text-center mb-8">
        <div className="inline-block rounded-2xl px-8 py-5 transition-all duration-500"
          style={{ backgroundColor: branding.color_primary + '15' }}>
          <p className="text-5xl font-bold transition-all duration-300" style={{ color: branding.color_primary, fontFamily: 'var(--font-heading)' }}>
            ~{animatingWeeks}
          </p>
          <p className="text-sm mt-1" style={{ color: branding.color_text_muted }}>weeks to goal</p>
        </div>

        {weeksSaved > 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-500"
            style={{ backgroundColor: branding.color_primary + '20', color: branding.color_primary }}>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {weeksSaved} weeks faster ({percentFaster}% quicker)
          </div>
        )}
      </div>

      {/* Matched package pricing */}
      {matchedPkg && (
        <div className="rounded-2xl p-5 text-center transition-all duration-500"
          style={{ backgroundColor: branding.color_card, borderWidth: '1px', borderColor: branding.color_border }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: branding.color_primary }}>
            {matchedPkg.name}
          </p>
          {services.show_prices && (
            <div className="flex items-center justify-center gap-6">
              {matchedPkg.monthly_price && (
                <div>
                  <p className="text-2xl font-bold" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>
                    £{matchedPkg.monthly_price}
                  </p>
                  <p className="text-[11px]" style={{ color: branding.color_text_muted }}>per month</p>
                </div>
              )}
              {matchedPkg.price_per_session && (
                <div>
                  <p className="text-2xl font-bold" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>
                    £{matchedPkg.price_per_session}
                  </p>
                  <p className="text-[11px]" style={{ color: branding.color_text_muted }}>per session</p>
                </div>
              )}
              {totalCost && (
                <div>
                  <p className="text-2xl font-bold" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>
                    £{totalCost.toLocaleString()}
                  </p>
                  <p className="text-[11px]" style={{ color: branding.color_text_muted }}>est. total</p>
                </div>
              )}
            </div>
          )}
          <p className={`text-[11px] ${services.show_prices ? 'mt-3' : ''}`} style={{ color: branding.color_text_muted }}>
            {matchedPkg.sessions_per_week}x per week for ~{displayWeeks} weeks
          </p>
        </div>
      )}

      {/* All packages overview */}
      {packages.length > 1 && (
        <div className="space-y-2">
          {packages
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((pkg) => {
              const isActive = matchedPkg?.id === pkg.id;
              const pkgMonths = displayWeeks / 4.33;
              const pkgTotal = pkg.monthly_price ? Math.round(pkg.monthly_price * pkgMonths) : null;

              return (
                <button key={pkg.id}
                  onClick={() => !pkg.is_online && setConfig({ ...config, sessionsPerWeek: pkg.sessions_per_week })}
                  className="w-full flex items-center justify-between rounded-xl p-3.5 transition-all duration-300 active:scale-[0.98]"
                  style={{
                    backgroundColor: isActive ? branding.color_primary + '12' : branding.color_card,
                    borderWidth: '1.5px',
                    borderColor: isActive ? branding.color_primary : branding.color_border,
                  }}>
                  <div className="text-left">
                    <p className="text-sm font-semibold" style={{ color: branding.color_text }}>{pkg.name}</p>
                    <p className="text-[11px]" style={{ color: branding.color_text_muted }}>
                      {pkg.is_online ? 'Online coaching' : `${pkg.sessions_per_week}x per week`}
                    </p>
                  </div>
                  {services.show_prices && (
                    <div className="text-right">
                      {pkg.monthly_price && (
                        <p className="text-sm font-bold" style={{ color: isActive ? branding.color_primary : branding.color_text }}>
                          £{pkg.monthly_price}<span className="text-[10px] font-normal" style={{ color: branding.color_text_muted }}>/mo</span>
                        </p>
                      )}
                      {pkgTotal && (
                        <p className="text-[10px]" style={{ color: branding.color_text_muted }}>
                          ~£{pkgTotal.toLocaleString()} total
                        </p>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
        </div>
      )}

      {/* Toggle controls */}
      <div className="space-y-4">
        {/* Sessions per week slider */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: branding.color_card, borderWidth: '1px', borderColor: branding.color_border }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-sm" style={{ color: branding.color_text }}>Sessions per week</p>
              <p className="text-xs mt-0.5" style={{ color: branding.color_text_muted }}>More sessions = faster results</p>
            </div>
            <span className="text-2xl font-bold min-w-[2ch] text-right" style={{ color: branding.color_primary, fontFamily: 'var(--font-heading)' }}>
              {config.sessionsPerWeek}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: branding.color_text_muted }}>1</span>
            <div className="flex-1 relative">
              <input type="range" min={1} max={6} step={1} value={config.sessionsPerWeek}
                onChange={(e) => setConfig({ ...config, sessionsPerWeek: parseInt(e.target.value) })}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, ${branding.color_primary} ${((config.sessionsPerWeek - 1) / 5) * 100}%, ${branding.color_border} ${((config.sessionsPerWeek - 1) / 5) * 100}%)` }} />
              <div className="flex justify-between mt-1.5 px-0.5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button key={n} onClick={() => setConfig({ ...config, sessionsPerWeek: n })}
                    className="w-6 h-6 rounded-full text-[10px] font-medium transition-all duration-200 active:scale-90"
                    style={{
                      backgroundColor: config.sessionsPerWeek >= n ? branding.color_primary + '30' : branding.color_card,
                      color: config.sessionsPerWeek >= n ? branding.color_primary : branding.color_text_muted,
                    }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs" style={{ color: branding.color_text_muted }}>6</span>
          </div>
        </div>

        {/* Nutrition support toggle — only if PT offers it */}
        {services.offers_nutrition && (
          <ToggleCard
            title={services.nutrition_label}
            description={services.nutrition_description}
            impact={baseInput.goalType === 'weight_loss' ? 'Up to 25% faster' : baseInput.goalType === 'muscle_gain' ? 'Up to 20% faster' : 'Up to 15% faster'}
            enabled={config.hasNutritionSupport}
            onToggle={() => setConfig({ ...config, hasNutritionSupport: !config.hasNutritionSupport })}
            branding={branding}
          />
        )}

        {/* Online coaching toggle — only if PT offers it */}
        {services.offers_online && (
          <ToggleCard
            title={services.online_label}
            description={services.online_description}
            impact="Up to 10% faster"
            enabled={config.hasOnlineCoaching}
            onToggle={() => setConfig({ ...config, hasOnlineCoaching: !config.hasOnlineCoaching })}
            branding={branding}
          />
        )}
      </div>
    </div>
  );
}

function ToggleCard({ title, description, impact, enabled, onToggle, branding }: {
  title: string; description: string; impact: string; enabled: boolean; onToggle: () => void; branding: TrainerBranding;
}) {
  return (
    <button onClick={onToggle} className="w-full text-left rounded-2xl p-5 transition-all duration-300 active:scale-[0.98]"
      style={{
        borderWidth: '1px',
        borderColor: enabled ? branding.color_primary + '60' : branding.color_border,
        backgroundColor: enabled ? branding.color_primary + '08' : branding.color_card,
      }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: branding.color_text }}>{title}</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: branding.color_text_muted }}>{description}</p>
          <span className="inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: enabled ? branding.color_primary + '20' : branding.color_card,
              color: enabled ? branding.color_primary : branding.color_text_muted,
            }}>
            {impact}
          </span>
        </div>

        <div className="w-12 h-7 rounded-full p-0.5 flex-shrink-0 transition-all duration-300 mt-0.5"
          style={{ backgroundColor: enabled ? branding.color_primary : branding.color_border }}>
          <div className="w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300"
            style={{ transform: enabled ? 'translateX(20px)' : 'translateX(0)' }} />
        </div>
      </div>
    </button>
  );
}
