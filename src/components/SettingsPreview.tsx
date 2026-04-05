'use client';

import { TrainerSpecialty, ServiceAddOn } from '@/types';
import { getGoogleFontsUrl } from '@/lib/branding';

interface PreviewWrapperProps {
  theme: 'light' | 'dark';
  primaryColor: string;
  children: React.ReactNode;
}

function PreviewWrapper({ theme, primaryColor, children }: PreviewWrapperProps) {
  const bg = theme === 'dark' ? '#0a0a0a' : '#ffffff';
  const border = theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e5ea';

  return (
    <div className="mt-6">
      <p className="text-[10px] text-[#8e8e93] uppercase tracking-wider font-semibold mb-2">Preview</p>
      <div className="rounded-2xl border overflow-hidden p-5" style={{ backgroundColor: bg, borderColor: border }}>
        {children}
      </div>
    </div>
  );
}

// --- Shared style helpers ---

function getColors(theme: 'light' | 'dark', primaryColor: string) {
  return {
    text: theme === 'dark' ? '#ffffff' : '#1a1a1a',
    muted: theme === 'dark' ? '#9ca3af' : '#8e8e93',
    card: theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f5f5f7',
    border: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e5ea',
    primary: primaryColor,
  };
}

// --- Copy Preview ---

export function CopyPreview({ theme, primaryColor, headline, subtext, ctaText, trainerName, fontHeading, fontBody }: {
  theme: 'light' | 'dark';
  primaryColor: string;
  headline: string;
  subtext: string;
  ctaText: string;
  trainerName: string;
  fontHeading?: string;
  fontBody?: string;
}) {
  const c = getColors(theme, primaryColor);
  const displayHeadline = headline || "Find out how long it'll take to reach your goal";
  const displaySubtext = subtext || 'Free personalised timeline in 60 seconds';
  const displayCta = ctaText || 'Get My Timeline';

  const headingStack = fontHeading && fontHeading !== 'system-ui' ? `'${fontHeading}', system-ui, sans-serif` : undefined;
  const bodyStack = fontBody && fontBody !== 'system-ui' ? `'${fontBody}', system-ui, sans-serif` : undefined;

  const fontsUrl = (fontHeading || fontBody) ? getGoogleFontsUrl({
    color_primary: primaryColor, color_secondary: '', color_accent: '',
    color_background: '', color_text: '', color_text_muted: '',
    color_card: '', color_border: '',
    font_heading: fontHeading || 'system-ui', font_body: fontBody || 'system-ui',
    theme, hero_image_url: null, hero_overlay_opacity: 0.6,
  }) : null;

  return (
    <PreviewWrapper theme={theme} primaryColor={primaryColor}>
      {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
      <div className="text-center max-w-xs mx-auto">
        <div className="w-14 h-14 rounded-full mx-auto mb-3 border-2 flex items-center justify-center text-sm font-bold"
          style={{ borderColor: c.primary, backgroundColor: c.primary + '33', color: c.text }}>
          {trainerName.split(' ').map(n => n[0]).join('') || 'PT'}
        </div>
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2" style={{ color: c.primary }}>
          {trainerName || 'Your Name'}
        </p>
        <h3 className="text-base font-bold leading-tight mb-1.5" style={{ color: c.text, fontFamily: headingStack }}>
          {displayHeadline}
        </h3>
        <p className="text-xs mb-4" style={{ color: c.muted, fontFamily: bodyStack }}>{displaySubtext}</p>
        <div className="py-2.5 rounded-xl text-white text-xs font-semibold" style={{ backgroundColor: c.primary, fontFamily: bodyStack }}>
          {displayCta}
        </div>
      </div>
    </PreviewWrapper>
  );
}

// --- Specialties Preview ---

export function SpecialtiesPreview({ theme, primaryColor, specialties }: {
  theme: 'light' | 'dark';
  primaryColor: string;
  specialties: TrainerSpecialty[];
}) {
  const c = getColors(theme, primaryColor);

  if (specialties.filter(s => s.name.trim()).length === 0) return null;

  return (
    <PreviewWrapper theme={theme} primaryColor={primaryColor}>
      <h4 className="text-sm font-bold mb-1 text-center" style={{ color: c.text }}>What&apos;s included</h4>
      <p className="text-[11px] text-center mb-3" style={{ color: c.muted }}>Here&apos;s what you get when you start</p>
      <div className="space-y-2">
        {specialties.filter(s => s.name.trim()).map((s, i) => (
          <div key={i} className="rounded-xl p-3" style={{ backgroundColor: c.card, borderWidth: '1px', borderColor: c.border }}>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: c.primary + '20' }}>
                <svg className="w-3 h-3" style={{ color: c.primary }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-xs" style={{ color: c.text }}>{s.name}</p>
                {s.description && <p className="text-[10px] leading-relaxed mt-0.5" style={{ color: c.muted }}>{s.description}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </PreviewWrapper>
  );
}

// --- Services Preview ---

export function ServicesPreview({ theme, primaryColor, addOns, showPrices }: {
  theme: 'light' | 'dark';
  primaryColor: string;
  addOns: ServiceAddOn[];
  showPrices: boolean;
}) {
  const c = getColors(theme, primaryColor);
  const validAddOns = addOns.filter(a => a.name.trim());

  if (validAddOns.length === 0) return null;

  return (
    <PreviewWrapper theme={theme} primaryColor={primaryColor}>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: c.muted }}>
        Add to your plan
      </p>
      <div className="space-y-2">
        {validAddOns.map((addOn, i) => {
          const isFirst = i === 0;
          return (
            <div key={addOn.id} className="rounded-xl p-3 text-left"
              style={{
                borderWidth: '1px',
                borderColor: isFirst ? c.primary + '60' : c.border,
                backgroundColor: isFirst ? c.primary + '08' : c.card,
              }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs" style={{ color: c.text }}>{addOn.name}</p>
                  {addOn.description && (
                    <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: c.muted }}>{addOn.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isFirst ? c.primary + '20' : c.card,
                        color: isFirst ? c.primary : c.muted,
                      }}>
                      Up to {addOn.timeline_reduction_percent}% faster
                    </span>
                    {showPrices && addOn.price_per_month && (
                      <span className="text-[9px]" style={{ color: c.muted }}>+£{addOn.price_per_month}/mo</span>
                    )}
                  </div>
                </div>
                <div className="w-9 h-5 rounded-full p-0.5 flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: isFirst ? c.primary : c.border }}>
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm"
                    style={{ transform: isFirst ? 'translateX(16px)' : 'translateX(0)' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PreviewWrapper>
  );
}
