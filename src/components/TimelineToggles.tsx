'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { GoalType, ExperienceLevel, TimelineConfig, TrainerBranding, TrainerServices, Package, TrainingMode } from '@/types';
import { calculateWithToggles, CalcInput } from '@/lib/calculateTimeline';
import { currencySymbol } from '@/lib/currency';

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
  currency?: string;
}

export default function TimelineToggles({ baseInput, baseWeeks, branding, services, packages, trainerName, currency }: TimelineTogglesProps) {
  const sym = currencySymbol(currency);
  const hasOnline = !!services.online?.enabled;
  const hasHybrid = !!services.hybrid?.enabled;
  const hasNutrition = !!services.nutrition?.enabled;

  // Available modes based on what PT offers
  const availableModes = useMemo(() => {
    const modes: { id: TrainingMode; label: string; sub: string }[] = [
      { id: 'inperson', label: 'In-person', sub: 'Train with your coach' },
    ];
    if (hasOnline) modes.push({ id: 'online', label: services.online?.name || 'Online', sub: 'Train remotely' });
    if (hasHybrid) modes.push({ id: 'hybrid', label: services.hybrid?.name || 'Hybrid', sub: 'Mix of both' });
    return modes;
  }, [hasOnline, hasHybrid, services]);

  const [config, setConfig] = useState<TimelineConfig>({
    mode: 'inperson',
    inPersonDays: baseInput.availableDays,
    onlineDays: 0,
    hasNutrition: false,
  });

  const [displayWeeks, setDisplayWeeks] = useState(baseWeeks);
  const [animatingWeeks, setAnimatingWeeks] = useState(baseWeeks);
  const animRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  const totalDays = config.mode === 'hybrid' ? config.inPersonDays + config.onlineDays
    : config.mode === 'online' ? config.onlineDays
    : config.inPersonDays;

  useEffect(() => {
    const calcInput: CalcInput = {
      goalType: baseInput.goalType,
      currentWeightKg: baseInput.currentWeightKg,
      goalWeightKg: baseInput.goalWeightKg,
      age: baseInput.age,
      experienceLevel: baseInput.experienceLevel,
      availableDays: baseInput.availableDays,
    };
    const target = calculateWithToggles(calcInput, config, services);
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
  }, [config, baseInput, services]);

  const weeksSaved = baseWeeks - displayWeeks;
  const percentFaster = baseWeeks > 0 ? Math.round((weeksSaved / baseWeeks) * 100) : 0;

  // Pricing
  const sortedPkgs = [...packages].filter(p => p.sessions_per_week > 0).sort((a, b) => a.sessions_per_week - b.sessions_per_week);
  const matchedPkg = sortedPkgs.find(p => p.sessions_per_week >= config.inPersonDays) || sortedPkgs[sortedPkgs.length - 1] || null;

  const months = displayWeeks / 4.33;
  let monthlyTotal = matchedPkg?.monthly_price || 0;
  if (config.hasNutrition && services.nutrition?.price_per_month) monthlyTotal += services.nutrition.price_per_month;
  if (config.mode === 'online' && services.online?.price_per_month) monthlyTotal = services.online.price_per_month + (config.hasNutrition && services.nutrition?.price_per_month ? services.nutrition.price_per_month : 0);
  if (config.mode === 'hybrid' && services.hybrid?.price_per_month) monthlyTotal = services.hybrid.price_per_month + (config.hasNutrition && services.nutrition?.price_per_month ? services.nutrition.price_per_month : 0);
  const grandTotal = monthlyTotal > 0 ? Math.round(monthlyTotal * months) : null;

  const setMode = (mode: TrainingMode) => {
    if (mode === 'inperson') {
      setConfig({ ...config, mode, onlineDays: 0 });
    } else if (mode === 'online') {
      setConfig({ ...config, mode, inPersonDays: 0, onlineDays: config.inPersonDays || 3 });
    } else if (mode === 'hybrid') {
      const total = config.inPersonDays || 3;
      const inPerson = Math.ceil(total / 2);
      setConfig({ ...config, mode, inPersonDays: inPerson, onlineDays: total - inPerson });
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-2 text-center" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>
        Build your plan
      </h3>
      <p className="text-sm text-center mb-8" style={{ color: branding.color_text_muted }}>
        Adjust your training to see how it affects your timeline
      </p>

      {/* Animated weeks */}
      <div className="text-center mb-8">
        <div className="inline-block rounded-2xl px-8 py-5 transition-all duration-500"
          style={{ backgroundColor: branding.color_primary + '15' }}>
          <p className="text-5xl font-bold transition-all duration-300" style={{ color: branding.color_primary, fontFamily: 'var(--font-heading)' }}>
            ~{animatingWeeks}
          </p>
          <p className="text-sm mt-1" style={{ color: branding.color_text_muted }}>weeks to goal</p>
        </div>
        {weeksSaved > 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: branding.color_primary + '20', color: branding.color_primary }}>
            {weeksSaved} weeks faster ({percentFaster}% quicker)
          </div>
        )}
        {weeksSaved < 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: '#FF3B3015', color: '#FF3B30' }}>
            {Math.abs(weeksSaved)} weeks longer (online is more flexible but slower)
          </div>
        )}
      </div>

      {/* Pricing summary */}
      {matchedPkg && services.show_prices && (
        <div className="rounded-2xl p-5 text-center mb-4 transition-all duration-500"
          style={{ backgroundColor: branding.color_card, borderWidth: '1px', borderColor: branding.color_border }}>
          <div className="flex items-center justify-center gap-6">
            {monthlyTotal > 0 && (
              <div>
                <p className="text-2xl font-bold" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>{sym}{monthlyTotal}</p>
                <p className="text-[11px]" style={{ color: branding.color_text_muted }}>per month</p>
              </div>
            )}
            {grandTotal && (
              <div>
                <p className="text-2xl font-bold" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>{sym}{grandTotal.toLocaleString()}</p>
                <p className="text-[11px]" style={{ color: branding.color_text_muted }}>est. total</p>
              </div>
            )}
          </div>
          <p className="text-[11px] mt-2" style={{ color: branding.color_text_muted }}>
            {totalDays}x per week for ~{displayWeeks} weeks
          </p>
        </div>
      )}

      {/* Training mode selector — only show if PT offers alternatives */}
      {availableModes.length > 1 && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: branding.color_text_muted }}>
            Training type
          </p>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${availableModes.length}, 1fr)` }}>
            {availableModes.map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className="py-3 px-2 rounded-xl text-center transition-all duration-200 active:scale-[0.97]"
                style={{
                  backgroundColor: config.mode === m.id ? branding.color_primary + '12' : branding.color_card,
                  borderWidth: '1.5px',
                  borderColor: config.mode === m.id ? branding.color_primary : branding.color_border,
                }}>
                <p className="text-xs font-semibold" style={{ color: config.mode === m.id ? branding.color_primary : branding.color_text }}>{m.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: branding.color_text_muted }}>{m.sub}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Day controls — varies by mode */}
      <div className="space-y-4">
        {/* In-person days (shown for inperson and hybrid) */}
        {(config.mode === 'inperson' || config.mode === 'hybrid') && (
          <DaySlider
            label={config.mode === 'hybrid' ? 'In-person sessions' : 'Sessions per week'}
            sublabel={config.mode === 'hybrid' ? 'Face-to-face with your coach' : 'More sessions = faster results'}
            value={config.inPersonDays}
            max={config.mode === 'hybrid' ? 5 : 6}
            onChange={(v) => setConfig({ ...config, inPersonDays: v })}
            branding={branding}
          />
        )}

        {/* Online days (shown for online and hybrid) */}
        {(config.mode === 'online' || config.mode === 'hybrid') && (
          <DaySlider
            label={config.mode === 'hybrid' ? 'Online sessions' : 'Online sessions per week'}
            sublabel={config.mode === 'hybrid' ? 'Guided programming you do solo' : services.online?.description || 'Structured programming delivered remotely'}
            value={config.onlineDays}
            max={config.mode === 'hybrid' ? 6 - config.inPersonDays : 6}
            onChange={(v) => setConfig({ ...config, onlineDays: v })}
            branding={branding}
          />
        )}

        {/* Nutrition toggle */}
        {hasNutrition && (
          <button onClick={() => setConfig({ ...config, hasNutrition: !config.hasNutrition })}
            className="w-full text-left rounded-2xl p-5 transition-all duration-300 active:scale-[0.98]"
            style={{
              borderWidth: '1px',
              borderColor: config.hasNutrition ? branding.color_primary + '60' : branding.color_border,
              backgroundColor: config.hasNutrition ? branding.color_primary + '08' : branding.color_card,
            }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: branding.color_text }}>{services.nutrition?.name || 'Nutrition support'}</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: branding.color_text_muted }}>
                  {services.nutrition?.description || 'Personalised meal plans & macro tracking'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: config.hasNutrition ? branding.color_primary + '20' : branding.color_card,
                      color: config.hasNutrition ? branding.color_primary : branding.color_text_muted,
                    }}>
                    Up to {services.nutrition?.timeline_reduction_percent || 20}% faster
                  </span>
                  {services.show_prices && services.nutrition?.price_per_month && (
                    <span className="text-[11px]" style={{ color: branding.color_text_muted }}>
                      +{sym}{services.nutrition.price_per_month}/mo
                    </span>
                  )}
                </div>
              </div>
              <div className="w-12 h-7 rounded-full p-0.5 flex-shrink-0 transition-all duration-300 mt-0.5"
                style={{ backgroundColor: config.hasNutrition ? branding.color_primary : branding.color_border }}>
                <div className="w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300"
                  style={{ transform: config.hasNutrition ? 'translateX(20px)' : 'translateX(0)' }} />
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Package selection */}
      {config.mode === 'inperson' && packages.length > 1 && (
        <div className="space-y-2 mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: branding.color_text_muted }}>Packages</p>
          {packages.sort((a, b) => a.sort_order - b.sort_order).map((pkg) => {
            const isActive = matchedPkg?.id === pkg.id;
            return (
              <button key={pkg.id}
                onClick={() => pkg.sessions_per_week > 0 && setConfig({ ...config, inPersonDays: pkg.sessions_per_week })}
                className="w-full flex items-center justify-between rounded-xl p-3.5 transition-all duration-300 active:scale-[0.98]"
                style={{
                  backgroundColor: isActive ? branding.color_primary + '12' : branding.color_card,
                  borderWidth: '1.5px',
                  borderColor: isActive ? branding.color_primary : branding.color_border,
                  opacity: pkg.sessions_per_week === 0 ? 0.5 : 1,
                }}>
                <div className="text-left">
                  <p className="text-sm font-semibold" style={{ color: branding.color_text }}>{pkg.name}</p>
                  <p className="text-[11px]" style={{ color: branding.color_text_muted }}>
                    {pkg.sessions_per_week > 0 ? `${pkg.sessions_per_week}x per week${pkg.is_online ? ' (online)' : ''}` : 'Contact for details'}
                  </p>
                </div>
                {services.show_prices && pkg.monthly_price && (
                  <p className="text-sm font-bold" style={{ color: isActive ? branding.color_primary : branding.color_text }}>
                    {sym}{pkg.monthly_price}<span className="text-[10px] font-normal" style={{ color: branding.color_text_muted }}>/mo</span>
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DaySlider({ label, sublabel, value, max, onChange, branding }: {
  label: string; sublabel: string; value: number; max: number;
  onChange: (v: number) => void; branding: TrainerBranding;
}) {
  const days = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: branding.color_card, borderWidth: '1px', borderColor: branding.color_border }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-semibold text-sm" style={{ color: branding.color_text }}>{label}</p>
          <p className="text-xs mt-0.5" style={{ color: branding.color_text_muted }}>{sublabel}</p>
        </div>
        <span className="text-2xl font-bold min-w-[2ch] text-right" style={{ color: branding.color_primary, fontFamily: 'var(--font-heading)' }}>
          {value}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs" style={{ color: branding.color_text_muted }}>1</span>
        <div className="flex-1 relative">
          <input type="range" min={1} max={max} step={1} value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, ${branding.color_primary} ${((value - 1) / (max - 1)) * 100}%, ${branding.color_border} ${((value - 1) / (max - 1)) * 100}%)` }} />
          <div className="flex justify-between mt-1.5 px-0.5">
            {days.map((n) => (
              <button key={n} onClick={() => onChange(n)}
                className="w-6 h-6 rounded-full text-[10px] font-medium transition-all duration-200 active:scale-90"
                style={{
                  backgroundColor: value >= n ? branding.color_primary + '30' : branding.color_card,
                  color: value >= n ? branding.color_primary : branding.color_text_muted,
                }}>
                {n}
              </button>
            ))}
          </div>
        </div>
        <span className="text-xs" style={{ color: branding.color_text_muted }}>{max}</span>
      </div>
    </div>
  );
}
