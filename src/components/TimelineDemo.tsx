'use client';

import { useState, useEffect, useRef } from 'react';

function calcWeeks(days: number, hasNutrition: boolean): number {
  const freqMultiplier = 1 / (1 + (Math.min(days, 6) - 2) * 0.12);
  let weeks = Math.ceil(16 * freqMultiplier);
  if (hasNutrition) weeks = Math.ceil(weeks * 0.8);
  return Math.max(weeks, 6);
}

const PACKAGES = [
  { name: '2x Per Week', days: 2, price: 280 },
  { name: '3x Per Week', days: 3, price: 380 },
  { name: '4x Per Week', days: 4, price: 460 },
  { name: '5x Per Week', days: 5, price: 550 },
];

export default function TimelineDemo() {
  const [days, setDays] = useState(3);
  const [nutrition, setNutrition] = useState(false);
  const [animWeeks, setAnimWeeks] = useState(15);
  const animRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  const target = calcWeeks(days, nutrition);

  useEffect(() => {
    const start = animWeeks;
    const diff = target - start;
    if (diff === 0) return;
    const duration = 500;
    const startTime = performance.now();
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimWeeks(Math.round(start + diff * eased));
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return (
    <section className="max-w-3xl mx-auto px-5 py-16">
      <div className="text-center mb-8">
        <p className="text-[#8e8e93] text-xs uppercase tracking-wider font-semibold mb-2">Try it yourself</p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">See how sessions change the timeline</h2>
        <p className="text-[#8e8e93] text-sm mt-2 max-w-md mx-auto">
          Drag the slider and toggle nutrition — the same interactive experience your prospects get.
        </p>
      </div>

      <div className="bg-[#0a0a0a] rounded-2xl overflow-hidden">
        {/* Weeks display */}
        <div className="text-center pt-8 pb-6">
          <div className="inline-block rounded-2xl px-8 py-5" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <p className="text-5xl font-bold text-white transition-all" style={{ fontFeatureSettings: '"tnum"' }}>
              ~{animWeeks}
            </p>
            <p className="text-sm text-white/40 mt-1">weeks to goal</p>
          </div>
          {nutrition && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/60">
              Nutrition shaves ~{Math.round(calcWeeks(days, false) - target)} weeks off
            </div>
          )}
        </div>

        {/* Sessions slider */}
        <div className="px-6 sm:px-10 pb-6">
          <div className="rounded-2xl p-5" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: '1px', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-white">Sessions per week</p>
                <p className="text-xs text-white/40 mt-0.5">More sessions = faster results</p>
              </div>
              <span className="text-2xl font-bold text-white" style={{ fontFeatureSettings: '"tnum"' }}>
                {days}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/30">1</span>
              <div className="flex-1 relative">
                <input type="range" min={1} max={6} step={1} value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ffffff ${((days - 1) / 5) * 100}%, rgba(255,255,255,0.15) ${((days - 1) / 5) * 100}%)`,
                  }} />
                <div className="flex justify-between mt-2 px-0.5">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button key={n} onClick={() => setDays(n)}
                      className="w-6 h-6 rounded-full text-[10px] font-medium transition-all active:scale-90"
                      style={{
                        backgroundColor: days >= n ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                        color: days >= n ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-xs text-white/30">6</span>
            </div>
          </div>

          {/* Nutrition toggle */}
          <button onClick={() => setNutrition(!nutrition)}
            className="w-full text-left rounded-2xl p-5 mt-3 transition-all active:scale-[0.99]"
            style={{
              borderWidth: '1px',
              borderColor: nutrition ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
              backgroundColor: nutrition ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
            }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-white">Add nutrition support</p>
                <p className="text-xs text-white/40 mt-1">Personalised meal plans — results up to 20% faster</p>
                <span className="inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: nutrition ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                    color: nutrition ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                  }}>
                  Up to 20% faster
                </span>
              </div>
              <div className="w-12 h-7 rounded-full p-0.5 transition-all duration-300 flex-shrink-0"
                style={{ backgroundColor: nutrition ? '#ffffff' : 'rgba(255,255,255,0.15)' }}>
                <div className="w-6 h-6 rounded-full shadow-md transition-transform duration-300"
                  style={{
                    backgroundColor: nutrition ? '#0a0a0a' : '#ffffff',
                    transform: nutrition ? 'translateX(20px)' : 'translateX(0)',
                  }} />
              </div>
            </div>
          </button>
        </div>

        {/* Package comparison */}
        <div className="px-6 sm:px-10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-2">Packages</p>
          <div className="space-y-1.5">
            {PACKAGES.map((pkg) => {
              const weeks = calcWeeks(pkg.days, nutrition);
              const isActive = pkg.days === days;
              return (
                <button key={pkg.name} onClick={() => setDays(pkg.days)}
                  className="w-full flex items-center justify-between rounded-xl p-3.5 transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                    borderWidth: '1.5px',
                    borderColor: isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.06)',
                  }}>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">{pkg.name}</p>
                    <p className="text-[11px] text-white/40">~{weeks} weeks to goal</p>
                  </div>
                  <p className="text-sm font-bold" style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)' }}>
                    £{pkg.price}<span className="text-[10px] font-normal text-white/30">/mo</span>
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
