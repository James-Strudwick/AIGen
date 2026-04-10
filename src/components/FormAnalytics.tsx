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

const stepSuggestions: Record<string, { text: string; action?: string }[]> = {
  hero: [
    { text: 'Try a more compelling headline — focus on the outcome, not the process', action: 'Settings → Copy → Hero headline' },
    { text: 'Add a professional photo to build trust immediately', action: 'Settings → Branding → Profile photo' },
    { text: 'Make your CTA button text more specific, e.g. "See my timeline"', action: 'Settings → Copy → CTA button text' },
    { text: 'Keep the page clean — a shorter subtext can improve click-through', action: 'Settings → Copy → Hero subtext' },
  ],
  goal: [
    { text: 'Too many choices causes decision paralysis — consider removing irrelevant goals', action: 'Settings → Goals → Remove goals' },
    { text: 'Make sure goal labels match how your audience describes their goals', action: 'Settings → Goals → Edit labels' },
    { text: 'Add more specific subtitles that resonate with your niche', action: 'Settings → Goals → Edit subtitles' },
  ],
  about: [
    { text: 'Turn off fields that aren\'t essential for this goal to shorten the form', action: 'Settings → Forms → About You → Toggle fields' },
    { text: 'Add a custom field if you need specific info (e.g. injuries, medical conditions)', action: 'Settings → Forms → About You → Add field' },
    { text: 'Consider whether weight fields are needed for all goals (e.g. fitness goals may not need them)', action: 'Settings → Forms → About You → Toggle weight' },
  ],
  availability: [
    { text: 'Set a default selection so prospects don\'t have to think as hard', action: 'Settings → Forms → Availability → Default days' },
    { text: 'Reduce the max days if your packages only go up to 4-5x per week', action: 'Settings → Forms → Availability → Max days' },
  ],
  questions: [
    { text: 'Each question adds friction — remove any that aren\'t essential', action: 'Settings → Questions → Remove questions' },
    { text: 'Use single-select where possible — multi-select takes more effort', action: 'Settings → Questions → Change type' },
    { text: 'Pro tip: create different questions per goal using custom forms', action: 'Settings → Forms → Questions' },
  ],
  capture: [
    { text: 'Prospects drop off here because they\'re not ready to share contact info', action: 'Settings → Forms → Contact' },
    { text: 'Try removing the phone field and just collecting name + email instead', action: 'Settings → Forms → Contact → Toggle phone' },
    { text: 'Or remove email and just ask for name + phone for a simpler form', action: 'Settings → Forms → Contact → Toggle email' },
    { text: 'Add a trust signal in your copy: "Your details are only shared with [your name]"' },
  ],
  results: [
    { text: 'Prospects who reach results are highly engaged — great conversion point' },
    { text: 'Make sure your packages show clear value — the upsell should feel natural' },
    { text: 'Try enabling nutrition as an add-on if you haven\'t already', action: 'Settings → Services → Nutrition' },
  ],
};

interface FormFunnelData {
  funnel: FunnelStep[];
  sessions: number;
}

interface Props {
  formNames?: Record<string, string>;
  isPro?: boolean;
}

export default function FormAnalytics({ formNames = {}, isPro = false }: Props) {
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [formFunnels, setFormFunnels] = useState<Record<string, FormFunnelData>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedForm, setSelectedForm] = useState<string>('all');

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
      setFormFunnels(data.formFunnels || {});
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return null;

  const hasData = totalSessions > 0;
  const hasFormFunnels = Object.keys(formFunnels).length > 0;

  // Resolve which funnel to show
  const activeFunnel = selectedForm === 'all' ? funnel : (formFunnels[selectedForm]?.funnel || []);
  const activeTotal = selectedForm === 'all' ? totalSessions : (formFunnels[selectedForm]?.sessions || 0);

  const currentStep = hasData ? activeFunnel[activeStep] : null;
  const dropoffRate = currentStep?.entered ? Math.round((currentStep.dropoff / currentStep.entered) * 100) : 0;
  const completionRate = currentStep?.entered ? Math.round((currentStep.completed / currentStep.entered) * 100) : 0;

  const overallConversion = activeTotal > 0 && activeFunnel.length > 0
    ? Math.round(((activeFunnel[activeFunnel.length - 1]?.entered || 0) / activeTotal) * 100) : 0;

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
          {/* Form selector (Pro only, when forms exist) */}
          {isPro && hasFormFunnels && (
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 -mx-1 px-1">
              <button onClick={() => { setSelectedForm('all'); setActiveStep(0); }}
                className="text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 transition-all"
                style={{ backgroundColor: selectedForm === 'all' ? '#1a1a1a' : '#f5f5f7', color: selectedForm === 'all' ? '#fff' : '#8e8e93' }}>
                All forms
              </button>
              {Object.keys(formFunnels).map((fId) => (
                <button key={fId} onClick={() => { setSelectedForm(fId); setActiveStep(0); }}
                  className="text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 transition-all"
                  style={{ backgroundColor: selectedForm === fId ? '#1a1a1a' : '#f5f5f7', color: selectedForm === fId ? '#fff' : '#8e8e93' }}>
                  {formNames[fId] || 'Form'}
                </button>
              ))}
            </div>
          )}

          {/* Mini funnel overview */}
          <div className="flex gap-0.5 mb-4">
            {activeFunnel.map((s, i) => {
              const maxEntered = activeFunnel[0]?.entered || 1;
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
                  <p className="text-[10px] text-[#8e8e93]">Step {activeStep + 1} of {activeFunnel.length}</p>
                </div>

                <button onClick={() => setActiveStep(Math.min(activeFunnel.length - 1, activeStep + 1))}
                  disabled={activeStep === activeFunnel.length - 1}
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
                      <div key={i} className="bg-white rounded-lg px-3 py-2.5 text-[11px] leading-relaxed">
                        <div className="flex items-start gap-2">
                          <span className="text-[#FF9500] mt-0.5 flex-shrink-0">•</span>
                          <span className="text-[#1a1a1a]">{suggestion.text}</span>
                        </div>
                        {suggestion.action && (
                          <p className="text-[9px] text-[#007AFF] mt-1 ml-4">{suggestion.action}</p>
                        )}
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
          {/* Reset button */}
          <button onClick={async () => {
            if (!confirm('Reset all analytics data? This clears your funnel stats so you can measure fresh after making changes.')) return;
            const supabase = createBrowserClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            await fetch('/api/analytics', {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
            setFunnel([]);
            setTotalSessions(0);
          }}
            className="w-full text-center text-[11px] text-[#8e8e93] hover:text-[#FF3B30] transition-colors py-2 mt-2">
            Reset analytics
          </button>
          </>
          )}
        </div>
      )}
    </div>
  );
}
