'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/auth';

interface FunnelStep {
  step: string;
  entered: number;
  completed: number;
  dropoff: number;
}

const stepLabels: Record<string, string> = {
  hero: 'Landing page',
  goal: 'Goal selection',
  about: 'About you',
  availability: 'Availability',
  questions: 'Custom questions',
  capture: 'Name & phone',
  results: 'Results',
};

const stepSuggestions: Record<string, string[]> = {
  hero: [
    'Try a more compelling headline — focus on the outcome, not the process',
    'Add a professional photo to build trust immediately',
    'Make your CTA button text more specific, e.g. "See my timeline" instead of "Get started"',
    'Keep the page clean — remove anything that distracts from the main CTA',
  ],
  goal: [
    'Consider reducing the number of goal options — too many choices causes decision paralysis',
    'Make sure the goal labels match how your target audience describes their goals',
    'Add more specific subtitles that resonate with your niche',
    'If you only serve one niche, consider removing irrelevant goals entirely',
  ],
  about: [
    'This form might feel too long — consider if all fields are essential',
    'Add reassuring text like "Takes 30 seconds" to reduce friction',
    'Make sure the weight unit toggle defaults to what your audience uses',
    'Pre-fill sensible defaults so users have less to think about',
  ],
  availability: [
    'Prospects may not know their availability yet — this could feel like commitment',
    'Pre-select a common option (e.g. 3 days) to reduce decision effort',
    'Make the copy more encouraging — "even 1 day makes a difference"',
  ],
  questions: [
    'You may have too many custom questions — each one adds friction',
    'Consider reducing to 1-2 essential questions only',
    'Make sure questions feel relevant and easy to answer, not like an interrogation',
    'Use single-select where possible — multi-select takes more effort',
  ],
  capture: [
    'Prospects drop off here because they\'re not ready to share their phone number',
    'Add a trust signal: "Your details are only shared with [your name]"',
    'Consider asking for just a first name to reduce friction',
    'Remind them what they\'re about to get: "Enter your details to see your personalised timeline"',
  ],
  results: [
    'Great — prospects who reach results are highly engaged',
    'Make sure the WhatsApp CTA is prominent and compelling',
    'The toggle controls should make the upsell obvious without being pushy',
  ],
};

export default function FormAnalytics() {
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/analytics', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return;

      const data = await res.json();
      setFunnel(data.funnel || []);
      setTotalSessions(data.totalSessions || 0);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return null;

  const hasData = totalSessions > 0;

  const currentStep = hasData ? funnel[activeStep] : null;
  const dropoffRate = currentStep?.entered ? Math.round((currentStep.dropoff / currentStep.entered) * 100) : 0;
  const completionRate = currentStep?.entered ? Math.round((currentStep.completed / currentStep.entered) * 100) : 0;

  const overallConversion = totalSessions > 0 && funnel.length > 0
    ? Math.round(((funnel[funnel.length - 1]?.entered || 0) / totalSessions) * 100) : 0;

  return (
    <div className="mb-6">
      <button onClick={() => setExpanded(!expanded)}
        className="w-full bg-[#f5f5f7] rounded-xl p-4 text-left transition-colors hover:bg-[#ebebed]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Form analytics</p>
            {hasData ? (
              <>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#1a1a1a]">
                  {totalSessions} visits
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#34C759]">
                  {overallConversion}% conversion
                </span>
              </>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#8e8e93]">
                No data yet
              </span>
            )}
          </div>
          <svg className={`w-4 h-4 text-[#8e8e93] transition-transform ${expanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="mt-3">
          {!hasData ? (
            <div className="bg-[#f5f5f7] rounded-xl p-6 text-center">
              <p className="text-sm text-[#8e8e93]">No data yet</p>
              <p className="text-xs text-[#8e8e93] mt-1">Share your link and analytics will appear here as prospects use your form</p>
            </div>
          ) : (
          <>
          {/* Mini funnel overview */}
          <div className="flex gap-0.5 mb-4">
            {funnel.map((s, i) => {
              const maxEntered = funnel[0]?.entered || 1;
              const height = Math.max((s.entered / maxEntered) * 40, 4);
              const isActive = i === activeStep;
              const stepDropoff = s.entered > 0 ? s.dropoff / s.entered : 0;

              return (
                <button key={s.step} onClick={() => setActiveStep(i)}
                  className="flex-1 flex flex-col items-center gap-1 transition-all"
                  style={{ opacity: isActive ? 1 : 0.5 }}>
                  <div className="w-full rounded-sm transition-all"
                    style={{
                      height: `${height}px`,
                      backgroundColor: stepDropoff > 0.3 ? '#FF3B30' : stepDropoff > 0.15 ? '#FF9500' : '#34C759',
                    }} />
                  <p className="text-[8px] leading-tight text-center" style={{ color: isActive ? '#1a1a1a' : '#8e8e93' }}>
                    {(stepLabels[s.step] || s.step).split(' ')[0]}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Step navigation */}
          {currentStep && (
            <div className="bg-[#f5f5f7] rounded-xl p-5">
              {/* Nav arrows + step name */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                  disabled={activeStep === 0}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center disabled:opacity-30 transition-all active:scale-90">
                  <svg className="w-4 h-4 text-[#1a1a1a]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                <div className="text-center">
                  <p className="text-sm font-semibold">{stepLabels[currentStep.step] || currentStep.step}</p>
                  <p className="text-[10px] text-[#8e8e93]">Step {activeStep + 1} of {funnel.length}</p>
                </div>

                <button onClick={() => setActiveStep(Math.min(funnel.length - 1, activeStep + 1))}
                  disabled={activeStep === funnel.length - 1}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center disabled:opacity-30 transition-all active:scale-90">
                  <svg className="w-4 h-4 text-[#1a1a1a]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Step stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-lg font-bold">{currentStep.entered}</p>
                  <p className="text-[9px] text-[#8e8e93]">Entered</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-lg font-bold" style={{ color: '#34C759' }}>{completionRate}%</p>
                  <p className="text-[9px] text-[#8e8e93]">Completed</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-lg font-bold" style={{ color: dropoffRate > 30 ? '#FF3B30' : dropoffRate > 15 ? '#FF9500' : '#34C759' }}>
                    {dropoffRate}%
                  </p>
                  <p className="text-[9px] text-[#8e8e93]">Drop-off</p>
                </div>
              </div>

              {/* Suggestions for this step */}
              {dropoffRate > 10 && (stepSuggestions[currentStep.step] || []).length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-[#8e8e93] uppercase tracking-wider mb-2">💡 Suggestions</p>
                  <div className="space-y-2">
                    {(stepSuggestions[currentStep.step] || []).map((suggestion, i) => (
                      <div key={i} className="bg-white rounded-lg px-3 py-2.5 text-[11px] text-[#1a1a1a] leading-relaxed flex items-start gap-2">
                        <span className="text-[#FF9500] mt-0.5 flex-shrink-0">•</span>
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dropoffRate <= 10 && (
                <div className="bg-white rounded-lg px-3 py-2.5 text-[11px] text-[#34C759] text-center font-medium">
                  ✓ This step is performing well — low drop-off
                </div>
              )}
            </div>
          )}
          </>
          )}
        </div>
      )}
    </div>
  );
}
