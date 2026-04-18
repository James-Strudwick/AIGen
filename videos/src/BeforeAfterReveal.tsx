import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

const BRAND = {
  bg: '#ffffff',
  dark: '#0a0a0a',
  text: '#1a1a1a',
  muted: '#8e8e93',
  card: '#f5f5f7',
  border: '#e5e5ea',
  green: '#25D366',
};

function BoringForm() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40 }}>
      <p style={{ fontSize: 13, color: BRAND.muted, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 24 }}>Generic contact form</p>
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {['Full name', 'Email address', 'Phone number'].map((label) => (
          <div key={label} style={{ background: BRAND.card, borderRadius: 12, padding: '14px 16px', fontSize: 14, color: BRAND.muted, border: `1px solid ${BRAND.border}` }}>{label}</div>
        ))}
        <div style={{ background: BRAND.card, borderRadius: 12, padding: '14px 16px', fontSize: 14, color: BRAND.muted, border: `1px solid ${BRAND.border}`, height: 80 }}>Tell us about your goals...</div>
        <div style={{ background: BRAND.border, borderRadius: 12, padding: '14px 0', fontSize: 14, color: BRAND.muted, textAlign: 'center', fontWeight: 600 }}>Submit</div>
      </div>
      <p style={{ fontSize: 13, color: BRAND.muted, marginTop: 24, textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>Prospect sees your price before they're sold. 90% ghost.</p>
    </div>
  );
}

function FomoFormsFlow() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, color: '#ffffff' }}>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 24 }}>FomoForms flow</p>
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { emoji: '🔥', label: 'Lose Weight', active: true },
            { emoji: '💪', label: 'Build Muscle', active: false },
            { emoji: '❤️', label: 'Get Fitter', active: false },
            { emoji: '🏃', label: 'Performance', active: false },
          ].map((g) => (
            <div key={g.label} style={{
              borderRadius: 16, padding: '14px 0', textAlign: 'center',
              border: g.active ? '1.5px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
              background: g.active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
            }}>
              <span style={{ fontSize: 20, display: 'block' }}>{g.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{g.label}</span>
            </div>
          ))}
        </div>

        <div style={{ borderRadius: 16, background: 'rgba(255,255,255,0.1)', padding: '20px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 42, fontWeight: 800, color: '#ffffff', margin: 0 }}>~14</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>weeks to goal</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { name: '3x Per Week', weeks: 14, price: '£380', active: true },
            { name: '5x Per Week', weeks: 10, price: '£550', active: false },
          ].map((p) => (
            <div key={p.name} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderRadius: 12, padding: '12px 16px',
              background: p.active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
              border: p.active ? '1.5px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)',
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{p.name}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: 0 }}>~{p.weeks} weeks</p>
              </div>
              <p style={{ fontSize: 13, fontWeight: 800, color: p.active ? '#fff' : 'rgba(255,255,255,0.5)', margin: 0 }}>{p.price}<span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.3)' }}>/mo</span></p>
            </div>
          ))}
        </div>

        <div style={{ borderRadius: 14, padding: '14px 0', textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#ffffff', background: BRAND.green }}>Message on WhatsApp</div>
      </div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 24, textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>Prospect is pre-sold before they message you.</p>
    </div>
  );
}

export const BeforeAfterReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Animation timeline:
  // 0-1s:   hold on boring form (100% visible)
  // 1-3s:   slide reveals FomoForms (right side grows)
  // 3-5s:   hold on split view ~30/70
  // 5-8s:   slide fully to FomoForms
  // 8-10s:  hold on FomoForms fully visible

  const slideProgress = interpolate(
    frame,
    [fps * 1, fps * 3, fps * 5, fps * 7],
    [100, 35, 35, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) },
  );

  // Handle position for the divider line
  const handleX = (slideProgress / 100) * width;

  // Label opacity: "BEFORE" fades as slider moves, "AFTER" fades in
  const beforeOpacity = interpolate(slideProgress, [100, 50], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const afterOpacity = interpolate(slideProgress, [60, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Bottom CTA text
  const ctaOpacity = interpolate(frame, [fps * 8, fps * 8.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ width, height, position: 'relative', overflow: 'hidden', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" }}>
      {/* Boring form (full background) */}
      <div style={{ position: 'absolute', inset: 0, background: BRAND.bg }}>
        <BoringForm />
      </div>

      {/* FomoForms (clipped from right) */}
      <div style={{ position: 'absolute', inset: 0, background: BRAND.dark, clipPath: `inset(0 0 0 ${slideProgress}%)` }}>
        <FomoFormsFlow />
      </div>

      {/* Divider line */}
      {slideProgress > 2 && slideProgress < 98 && (
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: handleX, width: 3, background: 'rgba(255,255,255,0.8)', zIndex: 10 }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 48, height: 48, borderRadius: '50%', background: '#ffffff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>↔</div>
        </div>
      )}

      {/* Labels */}
      <div style={{ position: 'absolute', top: 60, left: 32, opacity: beforeOpacity, zIndex: 20 }}>
        <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 800, color: BRAND.text, textTransform: 'uppercase', letterSpacing: 1.5 }}>Before</div>
      </div>
      <div style={{ position: 'absolute', top: 60, right: 32, opacity: afterOpacity, zIndex: 20 }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: 1.5 }}>After</div>
      </div>

      {/* Bottom CTA */}
      <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', opacity: ctaOpacity, zIndex: 20 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>fomoforms.com</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Build yours in 5 minutes</p>
      </div>
    </div>
  );
};
