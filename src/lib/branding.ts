import { Trainer, TrainerBranding } from '@/types';

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

  const isDark = b?.theme !== 'light';

  return {
    color_primary: b?.color_primary || primary,
    color_secondary: b?.color_secondary || secondary,
    color_accent: b?.color_accent || primary,
    color_background: b?.color_background || (isDark ? secondary : '#ffffff'),
    color_text: b?.color_text || (isDark ? '#ffffff' : '#111111'),
    color_text_muted: b?.color_text_muted || (isDark ? '#9ca3af' : '#6b7280'),
    color_card: b?.color_card || (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
    color_border: b?.color_border || (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
    font_heading: b?.font_heading || 'system-ui',
    font_body: b?.font_body || 'system-ui',
    theme: b?.theme || 'dark',
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
