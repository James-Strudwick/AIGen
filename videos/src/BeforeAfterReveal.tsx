import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

const BRAND = {
  bg: '#ffffff',
  dark: '#0a0a0a',
  text: '#1a1a1a',
  muted: '#8e8e93',
  card: '#f5f5f7',
  border: '#e5e5ea',
  green: '#25D366',
};

function BoringForm({ s }: { s: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 20 * s }}>
      <p style={{ fontSize: 13 * s, color: BRAND.muted, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 20 * s }}>Generic contact form</p>
      <div style={{ width: '80%', maxWidth: 420 * s, display: 'flex', flexDirection: 'column', gap: 12 * s }}>
        {['Full name', 'Email address', 'Phone number'].map((label) => (
          <div key={label} style={{ background: BRAND.card, borderRadius: 12 * s, padding: `${14 * s}px ${16 * s}px`, fontSize: 15 * s, color: BRAND.muted, border: `1px solid ${BRAND.border}` }}>{label}</div>
        ))}
        <div style={{ background: BRAND.card, borderRadius: 12 * s, padding: `${14 * s}px ${16 * s}px`, fontSize: 15 * s, color: BRAND.muted, border: `1px solid ${BRAND.border}`, height: 80 * s }}>Tell us about your goals...</div>
        <div style={{ background: BRAND.border, borderRadius: 12 * s, padding: `${14 * s}px 0`, fontSize: 15 * s, color: BRAND.muted, textAlign: 'center', fontWeight: 600 }}>Submit</div>
      </div>
      <p style={{ fontSize: 13 * s, color: BRAND.muted, marginTop: 20 * s, textAlign: 'center', maxWidth: 320 * s, lineHeight: 1.5 }}>Prospect sees your price before they're sold. 90% ghost.</p>
    </div>
  );
}

function FomoFormsFlow({ s }: { s: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 20 * s, color: '#ffffff' }}>
      <p style={{ fontSize: 13 * s, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 20 * s }}>FomoForms flow</p>
      <div style={{ width: '80%', maxWidth: 420 * s, display: 'flex', flexDirection: 'column', gap: 12 * s }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 * s }}>
          {[
            { emoji: '🔥', label: 'Lose Weight', active: true },
            { emoji: '💪', label: 'Build Muscle', active: false },
            { emoji: '❤️', label: 'Get Fitter', active: false },
            { emoji: '🏃', label: 'Performance', active: false },
          ].map((g) => (
            <div key={g.label} style={{
              borderRadius: 16 * s, padding: `${14 * s}px 0`, textAlign: 'center',
              border: g.active ? '1.5px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
              background: g.active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
            }}>
              <span style={{ fontSize: 22 * s, display: 'block' }}>{g.emoji}</span>
              <span style={{ fontSize: 13 * s, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{g.label}</span>
            </div>
          ))}
        </div>

        <div style={{ borderRadius: 16 * s, background: 'rgba(255,255,255,0.1)', padding: `${20 * s}px 0`, textAlign: 'center' }}>
          <p style={{ fontSize: 48 * s, fontWeight: 800, color: '#ffffff', margin: 0 }}>~14</p>
          <p style={{ fontSize: 13 * s, color: 'rgba(255,255,255,0.4)', margin: 0 }}>weeks to goal</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 * s }}>
          {[
            { name: '3x Per Week', weeks: 14, price: '£380', active: true },
            { name: '5x Per Week', weeks: 10, price: '£550', active: false },
          ].map((p) => (
            <div key={p.name} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderRadius: 12 * s, padding: `${12 * s}px ${16 * s}px`,
              background: p.active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
              border: p.active ? '1.5px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
            }}>
              <div>
                <p style={{ fontSize: 14 * s, fontWeight: 700, color: '#fff', margin: 0 }}>{p.name}</p>
                <p style={{ fontSize: 11 * s, color: 'rgba(255,255,255,0.4)', margin: 0 }}>~{p.weeks} weeks</p>
              </div>
              <p style={{ fontSize: 14 * s, fontWeight: 800, color: p.active ? '#fff' : 'rgba(255,255,255,0.5)', margin: 0 }}>{p.price}<span style={{ fontSize: 10 * s, fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>/mo</span></p>
            </div>
          ))}
        </div>

        <div style={{ borderRadius: 14 * s, padding: `${14 * s}px 0`, textAlign: 'center', fontSize: 15 * s, fontWeight: 700, color: '#ffffff', background: BRAND.green }}>Message on WhatsApp</div>
      </div>
      <p style={{ fontSize: 13 * s, color: 'rgba(255,255,255,0.35)', marginTop: 20 * s, textAlign: 'center', maxWidth: 320 * s, lineHeight: 1.5 }}>Prospect is pre-sold before they message you.</p>
    </div>
  );
}

export const BeforeAfterReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Scale factor: 1 for reel (1080x1920), bigger for square (1080x1080)
  const isSquare = width / height > 0.9;
  const s = isSquare ? 1.3 : 1;

  const slideProgress = interpolate(
    frame,
    [fps * 1, fps * 3, fps * 5, fps * 7],
    [100, 35, 35, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) },
  );

  const handleX = (slideProgress / 100) * width;
  const beforeOpacity = interpolate(slideProgress, [50, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const afterOpacity = interpolate(slideProgress, [20, 60], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ctaOpacity = interpolate(frame, [fps * 8, fps * 8.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ width, height, position: 'relative', overflow: 'hidden', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ position: 'absolute', inset: 0, background: BRAND.bg }}>
        <BoringForm s={s} />
      </div>

      <div style={{ position: 'absolute', inset: 0, background: BRAND.dark, clipPath: `inset(0 0 0 ${slideProgress}%)` }}>
        <FomoFormsFlow s={s} />
      </div>

      {slideProgress > 2 && slideProgress < 98 && (
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: handleX, width: 3, background: 'rgba(255,255,255,0.8)', zIndex: 10 }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 48 * s, height: 48 * s, borderRadius: '50%', background: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20 * s,
          }}>↔</div>
        </div>
      )}

      <div style={{ position: 'absolute', top: 40 * s, left: 24, opacity: beforeOpacity, zIndex: 20 }}>
        <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: 8, padding: `${6 * s}px ${14 * s}px`, fontSize: 11 * s, fontWeight: 800, color: BRAND.text, textTransform: 'uppercase', letterSpacing: 1.5 }}>Before</div>
      </div>
      <div style={{ position: 'absolute', top: 40 * s, right: 24, opacity: afterOpacity, zIndex: 20 }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: `${6 * s}px ${14 * s}px`, fontSize: 11 * s, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 1.5 }}>After</div>
      </div>

      <div style={{ position: 'absolute', bottom: isSquare ? 40 : 80, left: 0, right: 0, textAlign: 'center', opacity: ctaOpacity, zIndex: 20 }}>
        <p style={{ fontSize: 18 * s, fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>fomoforms.com</p>
        <p style={{ fontSize: 13 * s, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Build yours in 5 minutes</p>
      </div>
    </div>
  );
};
