import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

const GOALS = [
  {
    emoji: '🔥', label: 'Lose Weight', subtitle: 'Burn fat and get lean', color: '#FF6B35', weeks: 16,
    aboutFields: ['Age', 'Weight', 'Goal weight'],
    question: "What's held you back?",
    options: ['Motivation', 'Time', 'Diet'],
    specialty: 'Body Transformation',
    pkgName: '3x Per Week', pkgPrice: '£380',
  },
  {
    emoji: '💪', label: 'Build Muscle', subtitle: 'Get stronger and bigger', color: '#7C3AED', weeks: 20,
    aboutFields: ['Age', 'Weight', 'Experience'],
    question: 'Current training split?',
    options: ['Push/Pull', 'Bro split', 'Full body'],
    specialty: 'Strength Programming',
    pkgName: '4x Per Week', pkgPrice: '£460',
  },
  {
    emoji: '❤️', label: 'Get Fitter', subtitle: 'Feel healthier and fitter', color: '#EC4899', weeks: 12,
    aboutFields: ['Age', 'Experience'],
    question: "What does 'fit' mean to you?",
    options: ['Run 5K', 'More energy', 'Keep up with kids'],
    specialty: 'Functional Fitness',
    pkgName: '2x Per Week', pkgPrice: '£280',
  },
  {
    emoji: '🏃', label: 'Performance', subtitle: 'Hit a specific target', color: '#0EA5E9', weeks: 14,
    aboutFields: ['Age', 'Current PB', 'Target'],
    question: "What's your target?",
    options: ['Sub-25 5K', 'Marathon', 'Competition'],
    specialty: 'Run Coaching',
    pkgName: '5x Per Week', pkgPrice: '£550',
  },
];

function StepCard({ children, reveal, s, bg, border }: {
  children: React.ReactNode; reveal: number; s: number;
  bg?: string; border?: string;
}) {
  return (
    <div style={{
      opacity: reveal,
      transform: `translateY(${(1 - reveal) * 10 * s}px)`,
      borderRadius: 10 * s, padding: `${7 * s}px ${9 * s}px`,
      background: bg || 'rgba(255,255,255,0.04)',
      border: `1px solid ${border || 'rgba(255,255,255,0.06)'}`,
    }}>
      {children}
    </div>
  );
}

function GoalColumn({ goal, reveal, s }: {
  goal: typeof GOALS[0]; reveal: number; s: number;
}) {
  const r = (start: number, end: number) =>
    interpolate(reveal, [start, end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 * s, width: '100%' }}>
      {/* Timeline pill */}
      <StepCard reveal={r(0, 0.15)} s={s} bg={goal.color + '15'} border={goal.color + '30'}>
        <p style={{ fontSize: 22 * s, fontWeight: 800, color: goal.color, margin: 0, textAlign: 'center', lineHeight: 1 }}>~{goal.weeks}</p>
        <p style={{ fontSize: 7 * s, color: goal.color + '90', margin: `${2 * s}px 0 0`, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>weeks</p>
      </StepCard>

      {/* About You */}
      <StepCard reveal={r(0.12, 0.3)} s={s}>
        <p style={{ fontSize: 7 * s, color: 'rgba(255,255,255,0.35)', margin: `0 0 ${3 * s}px`, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>About you</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 * s }}>
          {goal.aboutFields.map((f) => (
            <div key={f} style={{
              borderRadius: 5 * s, padding: `${3 * s}px ${5 * s}px`,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)',
              fontSize: 7 * s, color: 'rgba(255,255,255,0.3)', fontWeight: 500,
            }}>{f}</div>
          ))}
        </div>
      </StepCard>

      {/* Question */}
      <StepCard reveal={r(0.28, 0.48)} s={s}>
        <p style={{ fontSize: 7 * s, color: 'rgba(255,255,255,0.35)', margin: `0 0 ${2 * s}px`, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}>Question</p>
        <p style={{ fontSize: 8 * s, color: 'rgba(255,255,255,0.7)', margin: `0 0 ${4 * s}px`, fontWeight: 600, lineHeight: 1.3 }}>{goal.question}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 * s }}>
          {goal.options.map((opt, i) => (
            <div key={opt} style={{
              fontSize: 7 * s, padding: `${3 * s}px ${5 * s}px`, borderRadius: 5 * s,
              background: i === 0 ? goal.color + '20' : 'rgba(255,255,255,0.03)',
              color: i === 0 ? goal.color : 'rgba(255,255,255,0.3)',
              border: `1px solid ${i === 0 ? goal.color + '30' : 'rgba(255,255,255,0.05)'}`,
              fontWeight: 600,
            }}>{opt}</div>
          ))}
        </div>
      </StepCard>

      {/* Specialty */}
      <StepCard reveal={r(0.45, 0.62)} s={s}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 * s }}>
          <div style={{
            width: 14 * s, height: 14 * s, borderRadius: 4 * s, flexShrink: 0,
            background: goal.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 7 * s, color: goal.color,
          }}>✓</div>
          <span style={{ fontSize: 8 * s, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{goal.specialty}</span>
        </div>
      </StepCard>

      {/* Package */}
      <StepCard reveal={r(0.6, 0.78)} s={s} bg={goal.color + '10'} border={goal.color + '25'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 8 * s, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{goal.pkgName}</span>
          <span style={{ fontSize: 9 * s, color: goal.color, fontWeight: 800 }}>{goal.pkgPrice}</span>
        </div>
      </StepCard>
    </div>
  );
}

export const ProGoalFlows: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isSquare = width / height > 0.9;
  const s = isSquare ? 1.1 : 1;

  const sp = (delay: number) => Math.min(spring({ frame: frame - delay, fps, config: { damping: 28, stiffness: 80 } }), 1);

  // ─── Timeline (20s = 600 frames @ 30fps) ───
  //
  //  0 - 1s     Fade in "What's your main goal?" header
  //  0.5 - 2s   Goal cards appear as 2x2 grid (like the real form)
  //  2 - 4s     Hold — viewer sees the real goal selector
  //  4 - 4.5s   Title crossfades to "With Pro..."
  //  4 - 6s     2x2 grid morphs into 4 columns, goal labels shrink
  //  6 - 12s    Steps cascade per column (staggered L→R, 0.8s gaps)
  // 12 - 13s    Pro CTA appears
  // 13 - 20s    Hold

  // ── Phase 1: goal selector (looks like the real form) ──

  const headerFade = interpolate(frame, [0, fps * 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Each goal card springs in with a tiny stagger
  const goalCardReveals = GOALS.map((_, i) =>
    frame > fps * 0.5 + i * 3 ? sp(fps * 0.5 + i * 3) : 0
  );

  // ── Phase 2: transition ──

  const splitProgress = frame > fps * 4 ? sp(fps * 4) : 0;

  // Title swap
  const title1Opacity = interpolate(frame, [fps * 3.8, fps * 4.3], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const title2Opacity = interpolate(frame, [fps * 4.3, fps * 4.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Goal card sizing: starts big (form-like), shrinks to column headers
  const cardPadY = interpolate(splitProgress, [0, 1], [20 * s, 12 * s], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardPadX = interpolate(splitProgress, [0, 1], [16 * s, 6 * s], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const emojiSize = interpolate(splitProgress, [0, 1], [36 * s, 24 * s], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const labelSize = interpolate(splitProgress, [0, 1], [15 * s, 11 * s], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const subtitleOpacity = interpolate(splitProgress, [0, 0.4], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Grid layout
  const gridCols = splitProgress > 0.15 ? 4 : 2;
  const gridGap = interpolate(splitProgress, [0, 1], [14 * s, 8 * s], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const gridWidth = splitProgress > 0.15
    ? `${interpolate(splitProgress, [0.15, 1], [65, 96], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}%`
    : isSquare ? '75%' : '70%';

  // ── Phase 3: step reveals (staggered per column) ──

  const columnReveals = GOALS.map((_, i) => {
    const start = fps * 6 + i * fps * 0.8;
    return frame > start ? sp(start) : 0;
  });

  // ── Phase 4: CTA ──

  const ctaOpacity = frame > fps * 12.5 ? sp(fps * 12.5) : 0;

  // Glow per column (builds once steps are revealing)
  const glowPerColumn = GOALS.map((g, i) => {
    const intensity = interpolate(columnReveals[i], [0.3, 0.8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return intensity;
  });

  return (
    <div style={{
      width, height, background: '#0a0a0a', position: 'relative', overflow: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: isSquare ? 48 * s : 90 * s,
      paddingLeft: 16 * s, paddingRight: 16 * s,
    }}>
      {/* ── Header area ── */}
      <div style={{
        textAlign: 'center', marginBottom: 20 * s, opacity: headerFade,
        minHeight: 70 * s, position: 'relative', width: '100%',
      }}>
        {/* Phase 1 title: looks like the real form */}
        <div style={{
          opacity: title1Opacity,
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <p style={{ fontSize: 22 * s, fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
            What&apos;s your main goal?
          </p>
          <p style={{ fontSize: 13 * s, color: 'rgba(255,255,255,0.35)', marginTop: 6 * s }}>
            Select the goal that matters most
          </p>
        </div>

        {/* Phase 2 title */}
        <div style={{
          opacity: title2Opacity,
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <p style={{ fontSize: 10 * s, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 6 * s }}>
            With Pro
          </p>
          <p style={{ fontSize: 22 * s, fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
            Each goal gets its own flow
          </p>
          <p style={{ fontSize: 13 * s, color: 'rgba(255,255,255,0.35)', marginTop: 6 * s }}>
            Different timeline. Different questions. Different packages.
          </p>
        </div>
      </div>

      {/* ── Goal grid → columns ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gap: gridGap,
        width: gridWidth,
        maxWidth: isSquare ? '100%' : 520 * s,
        alignItems: 'start',
      }}>
        {GOALS.map((goal, i) => (
          <div key={goal.label} style={{
            display: 'flex', flexDirection: 'column', gap: 5 * s,
            opacity: goalCardReveals[i],
            transform: `scale(${goalCardReveals[i]})`,
          }}>
            {/* Goal card (starts big like form, shrinks to column header) */}
            <div style={{
              borderRadius: 16 * s, padding: `${cardPadY}px ${cardPadX}px`, textAlign: 'center',
              background: `rgba(255,255,255,${0.05 + glowPerColumn[i] * 0.04})`,
              border: `${1 + glowPerColumn[i]}px solid ${glowPerColumn[i] > 0.3 ? goal.color + '50' : 'rgba(255,255,255,0.1)'}`,
              boxShadow: glowPerColumn[i] > 0.3 ? `0 0 ${20 * s}px ${goal.color}18` : 'none',
            }}>
              <span style={{ fontSize: emojiSize, display: 'block', marginBottom: 4 * s }}>{goal.emoji}</span>
              <span style={{ fontSize: labelSize, fontWeight: 700, color: '#ffffff', display: 'block' }}>{goal.label}</span>
              {subtitleOpacity > 0.01 && (
                <span style={{ fontSize: 10 * s, color: 'rgba(255,255,255,0.35)', display: 'block', marginTop: 3 * s, opacity: subtitleOpacity }}>
                  {goal.subtitle}
                </span>
              )}
            </div>

            {/* Steps (only appear after split) */}
            {splitProgress > 0.5 && (
              <GoalColumn goal={goal} reveal={columnReveals[i]} s={s} />
            )}
          </div>
        ))}
      </div>

      {/* ── Pro CTA ── */}
      <div style={{
        position: 'absolute', bottom: isSquare ? 36 * s : 65 * s,
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
