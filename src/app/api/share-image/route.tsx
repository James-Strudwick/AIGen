import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const style = searchParams.get('style') || 'minimal';
  const message = searchParams.get('message') || "Want to know how long it'll take to reach your goal?";

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

  return new ImageResponse(
    (
      <div
        style={{
          width: '1080px',
          height: '1920px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          background: style === 'gradient'
            ? `linear-gradient(135deg, ${primary}, ${primary}88, #ffffff)`
            : bg,
        }}
      >
        {/* Initials circle */}
        <div
          style={{
            width: '160px',
            height: '160px',
            borderRadius: '80px',
            border: `4px solid ${style === 'minimal' ? primary : 'rgba(255,255,255,0.3)'}`,
            backgroundColor: style === 'minimal' ? `${primary}20` : 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: 700,
            color: textColor,
            marginBottom: '48px',
          }}
        >
          {initials}
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: '24px',
            fontWeight: 600,
            letterSpacing: '4px',
            textTransform: 'uppercase' as const,
            color: style === 'minimal' ? primary : 'rgba(255,255,255,0.7)',
            marginBottom: '32px',
          }}
        >
          {trainer.name}
        </div>

        {/* Message */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 700,
            color: textColor,
            textAlign: 'center' as const,
            lineHeight: 1.2,
            marginBottom: '24px',
            maxWidth: '800px',
          }}
        >
          {message}
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: '28px',
            color: mutedColor,
            marginBottom: '64px',
          }}
        >
          Free personalised timeline in 60 seconds
        </div>

        {/* CTA button */}
        <div
          style={{
            backgroundColor: btnBg,
            color: btnText,
            fontSize: '32px',
            fontWeight: 600,
            padding: '24px 80px',
            borderRadius: '24px',
            marginBottom: '40px',
          }}
        >
          Try it free
        </div>

        {/* Link */}
        <div
          style={{
            fontSize: '24px',
            color: mutedColor,
          }}
        >
          {link}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    }
  );
}
