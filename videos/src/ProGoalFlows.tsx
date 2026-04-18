import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

const GOALS = [
  {
    emoji: '🔥', label: 'Lose Weight', color: '#FF6B35', weeks: 16,
    aboutFields: ['Age', 'Weight', 'Goal weight'],
    question: "What's held you back?",
    options: ['Motivation', 'Time', 'Diet'],
    specialty: 'Body Transformation',
    pkgName: '3x Per Week', pkgPrice: '£380',
  },
  {
    emoji: '💪', label: 'Build Muscle', color: '#7C3AED', weeks: 20,
    aboutFields: ['Age', 'Weight', 'Experience'],
    question: 'Current training split?',
    options: ['Push/Pull', 'Bro split', 'Full body'],
    specialty: 'Strength Programming',
    pkgName: '4x Per Week', pkgPrice: '£460',
  },
  {
    emoji: '❤️', label: 'Get Fitter', color: '#EC4899', weeks: 12,
    aboutFields: ['Age', 'Experience'],
    question: "What does 'fit' mean to you?",
    options: ['Run 5K', 'More energy', 'Keep up with kids'],
    specialty: 'Functional Fitness',
    pkgName: '2x Per Week', pkgPrice: '£280',
  },
  {
    emoji: '🏃', label: 'Performance', color: '#0EA5E9', weeks: 14,
    aboutFields: ['Age', 'Current PB', 'Target'],
    question: "What's your target?",
    options: ['Sub-25 5K', 'Marathon', 'Competition'],
    specialty: 'Run Coaching',
    pkgName: '5x Per Week', pkgPrice: '£550',
  },
];

function GoalColumn({ goal, reveal, s }: {
  goal: typeof GOALS[0];
  reveal: number; // 0-1 how revealed this column is (staggered per column)
  s: number;
}) {
  const headerReveal = interpolate(reveal, [0, 0.15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const timelineReveal = interpolate(reveal, [0.12, 0.3], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const aboutReveal = interpolate(reveal, [0.25, 0.45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const questionReveal = interpolate(reveal, [0.4, 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const specialtyReveal = interpolate(reveal, [0.55, 0.72], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const pkgReveal = interpolate(reveal, [0.68, 0.85], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glowIntensity = interpolate(reveal, [0.5, 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const slideUp = (r: number) => ({
    opacity: r,
    transform: `translateY(${(1 - r) * 12 * s}px)`,
  });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 5 * s,
      width: '100%', opacity: headerReveal,
    }}>
      {/* Goal header */}
      <div style={{
        borderRadius: 16 * s, padding: `${14 * s}px ${6 * s}px`, textAlign: 'center',
        background: `rgba(255,255,255,${0.05 + glowIntensity * 0.05})`,
        border: `${1 + glowIntensity}px solid ${glowIntensity > 0.3 ? goal.color + '50' : 'rgba(255,255,255,0.1)'}`,
        boxShadow: glowIntensity > 0.3 ? `0 0 ${24 * s}px ${goal.color}18, 0 0 ${8 * s}px ${goal.color}10` : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        <span style={{ fontSize: 26 * s, display: 'block', marginBottom: 4 * s }}>{goal.emoji}</span>
        <span style={{ fontSize: 12 * s, fontWeight: 700, color: '#ffffff', letterSpacing: -0.3 }}>{goal.label}</span>
      </div>

      {/* Timeline pill */}
      <div style={{
        ...slideUp(timelineReveal),
        borderRadius: 12 * s, padding: `${10 * s}px`, textAlign: 'center',
        background: goal.color + '15', border: `1px solid ${goal.color}30`,
      }}>
        <p style={{ fontSize: 24 * s, fontWeight: 800, color: goal.color, margin: 0, lineHeight: 1 }}>~{goal.weeks}</p>
        <p style={{ fontSize: 8 * s, color: goal.color + '90', margin: `${2 * s}px 0 0`, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>weeks</p>
      </div>

      {/* About You fields */}
      <div style={{
        ...slideUp(aboutReveal),
        borderRadius: 10 * s, padding: `${7 * s}px ${9 * s}px`,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <p style={{ fontSize: 7 * s, color: 'rgba(255,255,255,0.35)', margin: `0 0 ${4 * s}px`, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>About you</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 * s }}>
          {goal.aboutFields.map((f) => (
            <div key={f} style={{
              borderRadius: 6 * s, padding: `${4 * s}px ${6 * s}px`,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              fontSize: 8 * s, color: 'rgba(255,255,255,0.3)', fontWeight: 500,
            }}>{f}</div>
          ))}
        </div>
      </div>

      {/* Custom question */}
      <div style={{
        ...slideUp(questionReveal),
        borderRadius: 10 * s, padding: `${7 * s}px ${9 * s}px`,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <p style={{ fontSize: 7 * s, color: 'rgba(255,255,255,0.35)', margin: `0 0 ${3 * s}px`, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>Question</p>
        <p style={{ fontSize: 9 * s, color: 'rgba(255,255,255,0.75)', margin: `0 0 ${5 * s}px`, fontWeight: 600, lineHeight: 1.3 }}>{goal.question}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 * s }}>
          {goal.options.map((opt, i) => (
            <div key={opt} style={{
              fontSize: 7 * s, padding: `${3 * s}px ${6 * s}px`, borderRadius: 5 * s,
              background: i === 0 ? goal.color + '20' : 'rgba(255,255,255,0.04)',
              color: i === 0 ? goal.color : 'rgba(255,255,255,0.35)',
              border: `1px solid ${i === 0 ? goal.color + '35' : 'rgba(255,255,255,0.05)'}`,
              fontWeight: 600,
            }}>{opt}</div>
          ))}
        </div>
      </div>

      {/* Specialty */}
      <div style={{
        ...slideUp(specialtyReveal),
        borderRadius: 10 * s, padding: `${6 * s}px ${9 * s}px`,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 6 * s,
      }}>
        <div style={{
          width: 16 * s, height: 16 * s, borderRadius: 5 * s, flexShrink: 0,
          background: goal.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 8 * s, color: goal.color,
        }}>✓</div>
        <span style={{ fontSize: 8 * s, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{goal.specialty}</span>
      </div>

      {/* Package */}
      <div style={{
        ...slideUp(pkgReveal),
        borderRadius: 10 * s, padding: `${8 * s}px ${9 * s}px`,
        background: goal.color + '10', border: `1px solid ${goal.color}25`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 8 * s, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{goal.pkgName}</span>
        <span style={{ fontSize: 9 * s, color: goal.color, fontWeight: 800 }}>{goal.pkgPrice}</span>
      </div>
    </div>
  );
}

export const ProGoalFlows: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isSquare = width / height > 0.9;
  const s = isSquare ? 1.1 : 1;

  // Smoother spring config
  const sp = (delay: number) => spring({ frame: frame - delay, fps, config: { damping: 28, stiffness: 80 } });

  // ─── Animation timeline (20 seconds total @ 30fps = 600 frames) ───
  //
  //  0 - 2s    Title 1 fades in: "One form for every goal"
  //  1 - 3s    2x2 grid fades in (generic, same-looking)
  //  3 - 4s    Title crossfades to "A tailored flow for each goal"
  //  3.5 - 5s  Grid splits from 2x2 → 4 columns
  //  5 - 11s   Each column reveals its content one-by-one (staggered L→R)
  // 12 - 13s   Pro CTA fades in
  // 13 - 15s   Hold

  // Title
  const titleFade = interpolate(frame, [0, fps * 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const title1Opacity = interpolate(frame, [fps * 2.8, fps * 3.3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const title2Opacity = interpolate(frame, [fps * 3.3, fps * 3.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Grid
  const gridFade = interpolate(frame, [fps * 1, fps * 1.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Split: smooth spring from 2x2 → 4 columns
  const splitRaw = frame > fps * 3.5 ? sp(fps * 3.5) : 0;
  const splitProgress = Math.min(splitRaw, 1);

  // Per-column staggered reveal (each column starts 0.8s after the previous)
  const columnReveals = GOALS.map((_, i) => {
    const startFrame = fps * 5 + i * fps * 0.8;
    const raw = frame > startFrame ? sp(startFrame) : 0;
    return Math.min(raw, 1);
  });

  // CTA
  const ctaOpacity = frame > fps * 12 ? sp(fps * 12) : 0;

  // Layout
  const gridCols = splitProgress > 0.15 ? 4 : 2;
  const gap = interpolate(splitProgress, [0, 1], [14 * s, 8 * s], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const gridWidth = splitProgress > 0.15
    ? `${interpolate(splitProgress, [0.15, 1], [55, 96], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}%`
    : '50%';

  return (
    <div style={{
      width, height, background: '#0a0a0a', position: 'relative', overflow: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: isSquare ? 48 * s : 100 * s,
      paddingLeft: 20 * s, paddingRight: 20 * s,
    }}>
      {/* Titles */}
      <div style={{ textAlign: 'center', marginBottom: 24 * s, opacity: titleFade, minHeight: 80 * s, position: 'relative', width: '100%' }}>
        <div style={{ opacity: title1Opacity, position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: 10 * s, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 8 * s }}>Right now</p>
          <p style={{ fontSize: 22 * s, fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>One form for every goal</p>
          <p style={{ fontSize: 13 * s, color: 'rgba(255,255,255,0.35)', marginTop: 6 * s }}>Same questions. Same packages. Same pitch.</p>
        </div>
        <div style={{ opacity: title2Opacity, position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: 10 * s, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 8 * s }}>With Pro</p>
          <p style={{ fontSize: 22 * s, fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>A tailored flow for each goal</p>
          <p style={{ fontSize: 13 * s, color: 'rgba(255,255,255,0.35)', marginTop: 6 * s }}>Different questions. Different timelines. Different packages.</p>
        </div>
      </div>

      {/* Goal grid / columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gap: gap,
        width: gridWidth,
        opacity: gridFade,
        maxWidth: isSquare ? '100%' : 520 * s,
        alignItems: 'start',
      }}>
        {GOALS.map((goal, i) => (
          <GoalColumn key={goal.label} goal={goal} reveal={columnReveals[i]} s={s} />
        ))}
      </div>

      {/* Pro CTA */}
      <div style={{
        position: 'absolute', bottom: isSquare ? 36 * s : 70 * s,
        left: 0, right: 0, textAlign: 'center',
        opacity: ctaOpacity,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10 * s,
          background: 'rgba(255,255,255,0.08)', borderRadius: 16 * s,
          padding: `${12 * s}px ${24 * s}px`,
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <span style={{
            fontSize: 9 * s, fontWeight: 800, padding: `${4 * s}px ${10 * s}px`,
            borderRadius: 6 * s, background: '#ffffff', color: '#0a0a0a',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>Pro</span>
          <span style={{ fontSize: 15 * s, fontWeight: 700, color: '#ffffff' }}>£19.99/mo</span>
        </div>
        <p style={{ fontSize: 13 * s, color: 'rgba(255,255,255,0.35)', marginTop: 10 * s }}>fomoforms.com</p>
      </div>
    </div>
  );
};
