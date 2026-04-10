import { Trainer, TrainerBranding, TrainerServices, TrainerCopy, ServiceAddOn } from '@/types';

/** Curated fonts that work well for fitness branding */
export const AVAILABLE_FONTS = [
  { value: 'system-ui', label: 'System Default', google: false },
  { value: 'Inter', label: 'Inter', google: true },
  { value: 'Montserrat', label: 'Montserrat', google: true },
  { value: 'Poppins', label: 'Poppins', google: true },
  { value: 'Oswald', label: 'Oswald', google: true },
  { value: 'Raleway', label: 'Raleway', google: true },
  { value: 'Bebas Neue', label: 'Bebas Neue', google: true },
  { value: 'DM Sans', label: 'DM Sans', google: true },
  { value: 'Space Grotesk', label: 'Space Grotesk', google: true },
  { value: 'Archivo', label: 'Archivo', google: true },
  { value: 'Barlow', label: 'Barlow', google: true },
  { value: 'Outfit', label: 'Outfit', google: true },
  { value: 'Sora', label: 'Sora', google: true },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', google: true },
];

/** Resolve full branding from trainer, filling defaults from primary/secondary */
export function resolveBranding(trainer: Trainer): TrainerBranding {
  const primary = trainer.brand_color_primary || '#FF6B35';
  const secondary = trainer.brand_color_secondary || '#1A1A2E';
  const b = trainer.branding;

  // Default to light, clean, Apple-like theme
  const isDark = b?.theme === 'dark';

  return {
    color_primary: b?.color_primary || primary,
    color_secondary: b?.color_secondary || secondary,
    color_accent: b?.color_accent || primary,
    color_background: b?.color_background || (isDark ? '#0a0a0a' : '#ffffff'),
    color_text: b?.color_text || (isDark ? '#ffffff' : '#1a1a1a'),
    color_text_muted: b?.color_text_muted || (isDark ? '#9ca3af' : '#8e8e93'),
    color_card: b?.color_card || (isDark ? 'rgba(255,255,255,0.04)' : '#f5f5f7'),
    color_border: b?.color_border || (isDark ? 'rgba(255,255,255,0.08)' : '#e5e5ea'),
    font_heading: b?.font_heading || 'system-ui',
    font_body: b?.font_body || 'system-ui',
    theme: b?.theme || 'light',
    hero_image_url: b?.hero_image_url || null,
    hero_overlay_opacity: b?.hero_overlay_opacity ?? 0.6,
  };
}

/** Get Google Fonts URL for the trainer's selected fonts */
export function getGoogleFontsUrl(branding: TrainerBranding): string | null {
  const fonts: string[] = [];

  for (const fontName of [branding.font_heading, branding.font_body]) {
    const font = AVAILABLE_FONTS.find((f) => f.value === fontName);
    if (font?.google && !fonts.includes(fontName)) {
      fonts.push(fontName);
    }
  }

  if (fonts.length === 0) return null;

  const families = fonts.map((f) => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700;800;900`).join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/** CSS custom properties for a trainer's branding */
export function brandingToCssVars(branding: TrainerBranding): Record<string, string> {
  return {
    '--brand-primary': branding.color_primary,
    '--brand-secondary': branding.color_secondary,
    '--brand-accent': branding.color_accent,
    '--brand-bg': branding.color_background,
    '--brand-text': branding.color_text,
    '--brand-text-muted': branding.color_text_muted,
    '--brand-card': branding.color_card,
    '--brand-border': branding.color_border,
    '--font-heading': fontStack(branding.font_heading),
    '--font-body': fontStack(branding.font_body),
  };
}

function fontStack(font: string): string {
  if (font === 'system-ui') return 'system-ui, -apple-system, sans-serif';
  return `'${font}', system-ui, sans-serif`;
}

/** Resolve services config with defaults */
export function resolveServices(trainer: Trainer): TrainerServices {
  const s = trainer.services;
  return {
    show_prices: s?.show_prices ?? true,
    nutrition: s?.nutrition ?? null,
    online: s?.online ?? null,
    hybrid: s?.hybrid ?? null,
    add_ons: s?.add_ons ?? [],
  };
}

/** Resolve copy/messaging with defaults */
export function resolveCopy(trainer: Trainer): TrainerCopy {
  const c = trainer.copy;
  return {
    hero_headline: c?.hero_headline || `Find out how long it'll take to reach your goal`,
    hero_subtext: c?.hero_subtext || 'Free personalised timeline in 60 seconds',
    cta_button_text: c?.cta_button_text || 'Get My Timeline',
    tone: c?.tone || '',
  };
}
