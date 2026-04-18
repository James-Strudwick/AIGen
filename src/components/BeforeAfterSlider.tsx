'use client';

import { useState, useRef, useCallback } from 'react';

export default function BeforeAfterSlider() {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <section className="max-w-3xl mx-auto px-5 py-16">
      <div className="text-center mb-8">
        <p className="text-[#8e8e93] text-xs uppercase tracking-wider font-semibold mb-2">See the difference</p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Boring form vs FomoForms</h2>
      </div>

      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden border border-[#e5e5ea] select-none touch-none"
        style={{ height: 480 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Left: boring form (always full width, sits behind) */}
        <div className="absolute inset-0 bg-white p-6 sm:p-8 flex flex-col items-center justify-center">
          <p className="text-[10px] text-[#8e8e93] uppercase tracking-wider font-semibold mb-4">Generic contact form</p>
          <div className="w-full max-w-[280px] space-y-3">
            <div className="bg-[#f5f5f7] rounded-lg px-3 py-2.5 text-xs text-[#8e8e93] border border-[#e5e5ea]">Full name</div>
            <div className="bg-[#f5f5f7] rounded-lg px-3 py-2.5 text-xs text-[#8e8e93] border border-[#e5e5ea]">Email address</div>
            <div className="bg-[#f5f5f7] rounded-lg px-3 py-2.5 text-xs text-[#8e8e93] border border-[#e5e5ea]">Phone number</div>
            <div className="bg-[#f5f5f7] rounded-lg px-3 py-2.5 text-xs text-[#8e8e93] border border-[#e5e5ea] h-16">Tell us about your goals...</div>
            <div className="bg-[#e5e5ea] rounded-lg py-2.5 text-xs text-[#8e8e93] text-center font-medium">Submit</div>
          </div>
          <p className="text-[10px] text-[#8e8e93] mt-4 text-center max-w-[240px]">Prospect sees your price before they&apos;re sold. 90% ghost.</p>
        </div>

        {/* Right: FomoForms flow (clipped by slider position) */}
        <div
          className="absolute inset-0 bg-[#0a0a0a] p-6 sm:p-8 flex flex-col items-center justify-center"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        >
          <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-4">FomoForms flow</p>
          <div className="w-full max-w-[280px] space-y-3">
            {/* Goal selector */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { emoji: '🔥', label: 'Lose Weight' },
                { emoji: '💪', label: 'Build Muscle' },
                { emoji: '❤️', label: 'Get Fitter' },
                { emoji: '🏃', label: 'Performance' },
              ].map((g) => (
                <div key={g.label} className={`rounded-xl p-2.5 text-center border ${g.label === 'Lose Weight' ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/5'}`}>
                  <span className="text-sm block">{g.emoji}</span>
                  <span className="text-[10px] text-white/80 font-medium">{g.label}</span>
                </div>
              ))}
            </div>

            {/* Timeline result */}
            <div className="rounded-xl bg-white/10 p-4 text-center">
              <p className="text-3xl font-bold text-white">~14</p>
              <p className="text-[10px] text-white/50">weeks to goal</p>
            </div>

            {/* Package cards */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between rounded-lg px-3 py-2 bg-white/10 border border-white/20">
                <div>
                  <p className="text-[11px] font-semibold text-white">3x Per Week</p>
                  <p className="text-[9px] text-white/40">~14 weeks</p>
                </div>
                <p className="text-[11px] font-bold text-white">£380<span className="text-[8px] text-white/40">/mo</span></p>
              </div>
              <div className="flex items-center justify-between rounded-lg px-3 py-2 bg-white/5 border border-white/10">
                <div>
                  <p className="text-[11px] font-semibold text-white/70">5x Per Week</p>
                  <p className="text-[9px] text-white/40">~10 weeks</p>
                </div>
                <p className="text-[11px] font-bold text-white/70">£550<span className="text-[8px] text-white/40">/mo</span></p>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="rounded-xl py-2.5 text-center text-xs font-semibold text-white" style={{ backgroundColor: '#25D366' }}>
              Message on WhatsApp
            </div>
          </div>
          <p className="text-[10px] text-white/40 mt-4 text-center max-w-[240px]">Prospect is pre-sold before they message you.</p>
        </div>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 z-10 flex items-center"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-0.5 h-full bg-white/80" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center cursor-ew-resize">
            <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3m8-6l3 3-3 3" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-white/90 text-[9px] font-bold text-[#1a1a1a] uppercase tracking-wider z-20">Before</div>
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-white/20 text-[9px] font-bold text-white uppercase tracking-wider z-20">After</div>
      </div>

      <p className="text-center text-[#8e8e93] text-xs mt-3">Drag the slider to compare</p>
    </section>
  );
}
