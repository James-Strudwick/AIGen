import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const runtime = 'edge';

const RATIO_SIZES: Record<string, { width: number; height: number }> = {
  '9:16': { width: 1080, height: 1920 },
  '4:5': { width: 1080, height: 1350 },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const style = searchParams.get('style') || 'minimal';
  const message = searchParams.get('message') || "Want to know how long it'll take to reach your goal?";
  const subtext = searchParams.get('subtext') || 'Free personalised timeline in 60 seconds';
  const cta = searchParams.get('cta') || 'Try it free';
  const ratio = searchParams.get('ratio') || '9:16';
  const { width, height } = RATIO_SIZES[ratio] || RATIO_SIZES['9:16'];

  if (!slug) {
    return new Response('Missing slug', { status: 400 });
  }

  const supabase = getServiceClient();
  const { data: trainer } = await supabase
    .from('trainers')
    .select('name, brand_color_primary, photo_url, slug')
    .eq('slug', slug)
    .single();

  if (!trainer) {
    return new Response('Trainer not found', { status: 404 });
  }

  const primary = trainer.brand_color_primary || '#1a1a1a';
  const initials = trainer.name.split(' ').map((n: string) => n[0]).join('');
  const link = `fomoforms.com/${trainer.slug}`;

  const bg = style === 'bold' ? primary : style === 'gradient' ? primary : '#ffffff';
  const textColor = style === 'minimal' ? '#1a1a1a' : '#ffffff';
  const mutedColor = style === 'minimal' ? '#8e8e93' : 'rgba(255,255,255,0.6)';
  const btnBg = style === 'minimal' ? primary : '#ffffff';
  const btnText = style === 'minimal' ? '#ffffff' : primary;

  // Scale font sizes down a bit for squarer ratios so content doesn't overflow
  const scale = ratio === '4:5' ? 0.9 : 1;
  const initialsSize = Math.round(160 * scale);
  const nameSize = Math.round(24 * scale);
  const messageSize = Math.round(56 * scale);
  const subtextSize = Math.round(28 * scale);
  const ctaSize = Math.round(32 * scale);
  const linkSize = Math.round(24 * scale);
  const padding = Math.round(80 * scale);
  const gap = Math.round(48 * scale);

  return new ImageResponse(
    (
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${padding}px`,
          background: style === 'gradient'
            ? `linear-gradient(135deg, ${primary}, ${primary}88, #ffffff)`
            : bg,
        }}
      >
        {/* Initials circle */}
        <div
          style={{
            width: `${initialsSize}px`,
            height: `${initialsSize}px`,
            borderRadius: `${initialsSize / 2}px`,
            border: `4px solid ${style === 'minimal' ? primary : 'rgba(255,255,255,0.3)'}`,
            backgroundColor: style === 'minimal' ? `${primary}20` : 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${Math.round(initialsSize * 0.3)}px`,
            fontWeight: 700,
            color: textColor,
            marginBottom: `${gap}px`,
          }}
        >
          {initials}
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: `${nameSize}px`,
            fontWeight: 600,
            letterSpacing: '4px',
            textTransform: 'uppercase' as const,
            color: style === 'minimal' ? primary : 'rgba(255,255,255,0.7)',
            marginBottom: `${Math.round(32 * scale)}px`,
          }}
        >
          {trainer.name}
        </div>

        {/* Message */}
        <div
          style={{
            fontSize: `${messageSize}px`,
            fontWeight: 700,
            color: textColor,
            textAlign: 'center' as const,
            lineHeight: 1.2,
            marginBottom: `${Math.round(24 * scale)}px`,
            maxWidth: `${Math.round(800 * scale)}px`,
          }}
        >
          {message}
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: `${subtextSize}px`,
            color: mutedColor,
            marginBottom: `${Math.round(64 * scale)}px`,
            textAlign: 'center' as const,
            maxWidth: `${Math.round(800 * scale)}px`,
          }}
        >
          {subtext}
        </div>

        {/* CTA button */}
        <div
          style={{
            backgroundColor: btnBg,
            color: btnText,
            fontSize: `${ctaSize}px`,
            fontWeight: 600,
            padding: `${Math.round(24 * scale)}px ${Math.round(80 * scale)}px`,
            borderRadius: `${Math.round(24 * scale)}px`,
            marginBottom: `${Math.round(40 * scale)}px`,
          }}
        >
          {cta}
        </div>

        {/* Link */}
        <div
          style={{
            fontSize: `${linkSize}px`,
            color: mutedColor,
          }}
        >
          {link}
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  );
}
