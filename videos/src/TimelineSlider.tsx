import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

function calcWeeks(days: number, hasNutrition: boolean): number {
  const freqMultiplier = 1 / (1 + (Math.min(days, 6) - 2) * 0.12);
  let weeks = Math.ceil(16 * freqMultiplier);
  if (hasNutrition) weeks = Math.ceil(weeks * 0.8);
  return Math.max(weeks, 6);
}

const PACKAGES = [
  { name: '2x Per Week', days: 2, price: '£280' },
  { name: '3x Per Week', days: 3, price: '£380' },
  { name: '4x Per Week', days: 4, price: '£460' },
  { name: '5x Per Week', days: 5, price: '£550' },
];

export const TimelineSlider: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isSquare = width / height > 0.9;
  const s = isSquare ? 1.2 : 1;
  const contentWidth = isSquare ? '85%' : 360;

  // Animation timeline:
  // 0-2s:   fade in with 3 sessions, show ~15 weeks
  // 2-5s:   slide sessions from 3 → 5 slowly
  // 5-7s:   hold at 5 sessions
  // 7-9s:   toggle nutrition ON, weeks drop
  // 9-12s:  hold final state
  // 12-15s: show CTA

  const fadeIn = interpolate(frame, [0, fps * 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const sessionsDays = interpolate(
    frame,
    [fps * 2, fps * 3.5, fps * 4.5, fps * 5],
    [3, 3, 5, 5],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) },
  );
  const currentDays = Math.round(sessionsDays);

  const nutritionProgress = interpolate(
    frame,
    [fps * 7, fps * 8],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const hasNutrition = nutritionProgress > 0.5;

  const weeks = calcWeeks(currentDays, hasNutrition);

  const ctaOpacity = interpolate(frame, [fps * 12, fps * 13], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const sliderPosition = ((currentDays - 1) / 5) * 100;

  const toggleX = interpolate(nutritionProgress, [0, 1], [0, 20]);
  const toggleBg = nutritionProgress > 0.5 ? '#ffffff' : 'rgba(255,255,255,0.15)';
  const toggleDot = nutritionProgress > 0.5 ? '#0a0a0a' : '#ffffff';

  return (
    <div style={{
      width, height, background: '#0a0a0a', position: 'relative', overflow: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 32 * s, opacity: fadeIn,
    }}>
      {/* Header */}
      <p style={{ fontSize: 13 * s, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>
        Your personalised timeline
      </p>
      <p style={{ fontSize: 20 * s, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 28 * s }}>
        Drag to see how sessions affect your results
      </p>

      {/* Weeks display */}
      <div style={{ borderRadius: 24 * s, padding: `${28 * s}px ${40 * s}px`, background: 'rgba(255,255,255,0.08)', textAlign: 'center', marginBottom: 24 * s }}>
        <p style={{ fontSize: 72 * s, fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>~{weeks}</p>
        <p style={{ fontSize: 16 * s, color: 'rgba(255,255,255,0.4)', margin: '8px 0 0' }}>weeks to goal</p>
      </div>

      {hasNutrition && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 999,
          background: 'rgba(255,255,255,0.1)', marginBottom: 24,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
            Nutrition shaves ~{calcWeeks(currentDays, false) - weeks} weeks off
          </span>
        </div>
      )}

      {/* Slider */}
      <div style={{ width: contentWidth, borderRadius: 20, padding: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', margin: 0 }}>Sessions per week</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>More sessions = faster results</p>
          </div>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', fontFeatureSettings: '"tnum"' }}>{currentDays}</span>
        </div>

        {/* Fake slider track */}
        <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
          <div style={{ height: 8, borderRadius: 4, background: '#ffffff', width: `${sliderPosition}%`, transition: 'width 0.1s' }} />
          <div style={{
            position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
            left: `${sliderPosition}%`,
            width: 20, height: 20, borderRadius: '50%', background: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }} />
        </div>

        {/* Number dots */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600,
              background: currentDays >= n ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
              color: currentDays >= n ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
            }}>{n}</div>
          ))}
        </div>
      </div>

      {/* Nutrition toggle */}
      <div style={{
        width: 360, borderRadius: 20, padding: 24, marginBottom: 24,
        background: hasNutrition ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hasNutrition ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', margin: 0 }}>Add nutrition support</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>Results up to 20% faster</p>
          </div>
          <div style={{ width: 48, height: 28, borderRadius: 14, padding: 2, background: toggleBg, flexShrink: 0 }}>
            <div style={{ width: 24, height: 24, borderRadius: 12, background: toggleDot, transform: `translateX(${toggleX}px)`, boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
          </div>
        </div>
      </div>

      {/* Package cards */}
      <div style={{ width: contentWidth, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {PACKAGES.map((pkg) => {
          const pkgWeeks = calcWeeks(pkg.days, hasNutrition);
          const isActive = pkg.days === currentDays;
          return (
            <div key={pkg.name} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderRadius: 14, padding: '14px 18px',
              background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${isActive ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', margin: 0 }}>{pkg.name}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>~{pkgWeeks} weeks to goal</p>
              </div>
              <p style={{ fontSize: 14, fontWeight: 800, color: isActive ? '#fff' : 'rgba(255,255,255,0.45)', margin: 0 }}>
                {pkg.price}<span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.25)' }}>/mo</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', opacity: ctaOpacity }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: '0 0 8px' }}>fomoforms.com</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Give every lead their own timeline</p>
      </div>
    </div>
  );
};
