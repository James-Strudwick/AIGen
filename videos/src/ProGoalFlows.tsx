import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from 'remotion';

const GOALS = [
  {
    emoji: '🔥', label: 'Lose Weight', color: '#FF6B35',
    question: "What's held you back?",
    options: ['Motivation', 'Time', 'Diet'],
    specialty: 'Body Transformation',
    pkg: '3x/wk — £380/mo',
  },
  {
    emoji: '💪', label: 'Build Muscle', color: '#7C3AED',
    question: 'Current training split?',
    options: ['Push/Pull', 'Bro split', 'None yet'],
    specialty: 'Strength Programming',
    pkg: '4x/wk — £460/mo',
  },
  {
    emoji: '❤️', label: 'Get Fitter', color: '#EC4899',
    question: "What does 'fit' mean to you?",
    options: ['Run 5K', 'More energy', 'Keep up with kids'],
    specialty: 'Functional Fitness',
    pkg: '2x/wk — £280/mo',
  },
  {
    emoji: '🏃', label: 'Performance', color: '#0EA5E9',
    question: "What's your target?",
    options: ['Sub-25 5K', 'First marathon', 'Competition'],
    specialty: 'Run Coaching',
    pkg: '5x/wk — £550/mo',
  },
];

function GoalCard({ goal, progress, index, s }: {
  goal: typeof GOALS[0];
  progress: number; // 0 = collapsed in grid, 1 = expanded with details
  index: number;
  s: number;
}) {
  const detailOpacity = interpolate(progress, [0.4, 0.7], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cardScale = interpolate(progress, [0, 0.3], [1, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const borderGlow = interpolate(progress, [0.3, 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'stretch',
      transform: `scale(${cardScale})`,
      width: '100%',
    }}>
      {/* Goal header card */}
      <div style={{
        borderRadius: 20 * s, padding: `${18 * s}px`, textAlign: 'center',
        background: `rgba(255,255,255,${0.06 + borderGlow * 0.04})`,
        border: `${1.5 + borderGlow}px solid ${borderGlow > 0.5 ? goal.color + '60' : 'rgba(255,255,255,0.1)'}`,
        boxShadow: borderGlow > 0.5 ? `0 0 ${20 * s}px ${goal.color}20` : 'none',
      }}>
        <span style={{ fontSize: 32 * s, display: 'block', marginBottom: 6 * s }}>{goal.emoji}</span>
        <span style={{ fontSize: 14 * s, fontWeight: 700, color: '#ffffff' }}>{goal.label}</span>
      </div>

      {/* Expanded details — unique per goal */}
      <div style={{
        opacity: detailOpacity,
        marginTop: 8 * s,
        display: 'flex', flexDirection: 'column', gap: 6 * s,
      }}>
        {/* Custom question */}
        <div style={{
          borderRadius: 12 * s, padding: `${10 * s}px ${12 * s}px`,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <p style={{ fontSize: 9 * s, color: 'rgba(255,255,255,0.4)', margin: `0 0 ${4 * s}px`, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Custom question</p>
          <p style={{ fontSize: 11 * s, color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: 600 }}>{goal.question}</p>
          <div style={{ display: 'flex', gap: 4 * s, marginTop: 6 * s, flexWrap: 'wrap' }}>
            {goal.options.map((opt, i) => (
              <span key={opt} style={{
                fontSize: 8 * s, padding: `${3 * s}px ${6 * s}px`, borderRadius: 6 * s,
                background: i === 0 ? goal.color + '25' : 'rgba(255,255,255,0.06)',
                color: i === 0 ? goal.color : 'rgba(255,255,255,0.4)',
                border: i === 0 ? `1px solid ${goal.color}40` : '1px solid rgba(255,255,255,0.06)',
                fontWeight: 600,
              }}>{opt}</span>
            ))}
          </div>
        </div>

        {/* Specialty */}
        <div style={{
          borderRadius: 12 * s, padding: `${8 * s}px ${12 * s}px`,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 8 * s,
        }}>
          <div style={{
            width: 20 * s, height: 20 * s, borderRadius: 6 * s,
            background: goal.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10 * s, color: goal.color, flexShrink: 0,
          }}>✓</div>
          <span style={{ fontSize: 10 * s, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{goal.specialty}</span>
        </div>

        {/* Package */}
        <div style={{
          borderRadius: 12 * s, padding: `${8 * s}px ${12 * s}px`,
          background: goal.color + '12',
          border: `1px solid ${goal.color}30`,
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 10 * s, color: goal.color, fontWeight: 700 }}>{goal.pkg}</span>
        </div>
      </div>
    </div>
  );
}

export const ProGoalFlows: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isSquare = width / height > 0.9;
  const s = isSquare ? 1.15 : 1;

  // Animation timeline:
  // 0-1.5s:  Title fades in — "One form for every goal?"
  // 1.5-3s:  Show 2x2 goal grid (generic, all look the same)
  // 3-4s:    Title changes to "Or a tailored flow for each?"
  // 4-7s:    Goals separate into 4 columns, details expand
  // 7-10s:   Hold — all 4 visible with their unique content
  // 10-12s:  "Pro" badge + CTA appears
  // 12-15s:  Hold CTA

  const titleFade = interpolate(frame, [0, fps * 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const gridFade = interpolate(frame, [fps * 1, fps * 1.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Transition from "generic" state to "per-goal" state
  const splitProgress = interpolate(
    frame,
    [fps * 3.5, fps * 6],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.ease) },
  );

  // Title swap
  const title1Opacity = interpolate(frame, [fps * 3, fps * 3.5], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const title2Opacity = interpolate(frame, [fps * 3.5, fps * 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // CTA
  const ctaOpacity = interpolate(frame, [fps * 10, fps * 11], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Layout: starts as 2x2, becomes 4 columns
  const gap = interpolate(splitProgress, [0, 1], [12 * s, 10 * s], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const gridCols = splitProgress > 0.3 ? 4 : 2;
  const gridWidth = splitProgress > 0.3
    ? `${interpolate(splitProgress, [0.3, 1], [60, 94], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}%`
    : '55%';

  return (
    <div style={{
      width, height, background: '#0a0a0a', position: 'relative', overflow: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: `${40 * s}px`,
    }}>
      {/* Title — swaps mid-animation */}
      <div style={{ textAlign: 'center', marginBottom: 28 * s, opacity: titleFade }}>
        {/* Title 1: generic */}
        <div style={{ opacity: title1Opacity, position: title1Opacity < 0.01 ? 'absolute' : 'relative' }}>
          <p style={{ fontSize: 11 * s, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 8 * s }}>
            Right now
          </p>
          <p style={{ fontSize: 24 * s, fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
            One form for every goal
          </p>
          <p style={{ fontSize: 14 * s, color: 'rgba(255,255,255,0.4)', marginTop: 8 * s }}>
            Same questions. Same packages. Same pitch.
          </p>
        </div>

        {/* Title 2: per-goal */}
        <div style={{ opacity: title2Opacity, position: title2Opacity < 0.01 ? 'absolute' : 'relative' }}>
          <p style={{ fontSize: 11 * s, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 8 * s }}>
            With Pro
          </p>
          <p style={{ fontSize: 24 * s, fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
            A tailored flow for each goal
          </p>
          <p style={{ fontSize: 14 * s, color: 'rgba(255,255,255,0.4)', marginTop: 8 * s }}>
            Different questions. Different packages. Different pitch.
          </p>
        </div>
      </div>

      {/* Goal grid / columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gap: gap,
        width: gridWidth,
        opacity: gridFade,
        maxWidth: isSquare ? '100%' : 500 * s,
      }}>
        {GOALS.map((goal, i) => (
          <GoalCard key={goal.label} goal={goal} progress={splitProgress} index={i} s={s} />
        ))}
      </div>

      {/* Pro CTA */}
      <div style={{
        position: 'absolute', bottom: isSquare ? 48 * s : 80 * s,
        left: 0, right: 0, textAlign: 'center',
        opacity: ctaOpacity,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10 * s,
          background: 'rgba(255,255,255,0.08)', borderRadius: 16 * s,
          padding: `${14 * s}px ${28 * s}px`,
          border: '1px solid rgba(255,255,255,0.15)',
        }}>
          <span style={{
            fontSize: 10 * s, fontWeight: 800, padding: `${4 * s}px ${10 * s}px`,
            borderRadius: 6 * s, background: '#ffffff', color: '#0a0a0a',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>Pro</span>
          <span style={{ fontSize: 16 * s, fontWeight: 700, color: '#ffffff' }}>£19.99/mo</span>
        </div>
        <p style={{ fontSize: 14 * s, color: 'rgba(255,255,255,0.4)', marginTop: 12 * s }}>
          fomoforms.com
        </p>
      </div>
    </div>
  );
};
