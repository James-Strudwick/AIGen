import { makeScene2D, Rect, Txt, Layout, Node, Circle } from '@motion-canvas/2d';
import { all, chain, waitFor, sequence, createRef, createRefArray, Vector2, easeInOutCubic, easeOutBack, easeOutCubic, linear } from '@motion-canvas/core';

const GOALS = [
  {
    emoji: '🔥', label: 'Lose Weight', subtitle: 'Burn fat and get lean',
    color: '#FF6B35', weeks: 16,
    aboutFields: ['Age', 'Weight', 'Goal weight'],
    question: "What's held you back?",
    options: ['Motivation', 'Time', 'Diet'],
    specialty: 'Body Transformation',
    pkgName: '3x Per Week', pkgPrice: '£380',
  },
  {
    emoji: '💪', label: 'Build Muscle', subtitle: 'Get stronger and bigger',
    color: '#7C3AED', weeks: 20,
    aboutFields: ['Age', 'Weight', 'Experience'],
    question: 'Current training split?',
    options: ['Push/Pull', 'Bro split', 'Full body'],
    specialty: 'Strength Programming',
    pkgName: '4x Per Week', pkgPrice: '£460',
  },
  {
    emoji: '❤️', label: 'Get Fitter', subtitle: 'Feel healthier and fitter',
    color: '#EC4899', weeks: 12,
    aboutFields: ['Age', 'Experience'],
    question: "What does 'fit' mean?",
    options: ['Run 5K', 'More energy', 'Keep up with kids'],
    specialty: 'Functional Fitness',
    pkgName: '2x Per Week', pkgPrice: '£280',
  },
  {
    emoji: '🏃', label: 'Performance', subtitle: 'Hit a specific target',
    color: '#0EA5E9', weeks: 14,
    aboutFields: ['Age', 'Current PB', 'Target'],
    question: "What's your target?",
    options: ['Sub-25 5K', 'Marathon', 'Competition'],
    specialty: 'Run Coaching',
    pkgName: '5x Per Week', pkgPrice: '£550',
  },
];

export default makeScene2D(function* (view) {
  // Background
  view.fill('#0a0a0a');

  // ─────── ACT 1: Goal selector (looks like the real form) ───────

  const title1 = createRef<Txt>();
  const subtitle1 = createRef<Txt>();

  view.add(
    <Txt
      ref={title1}
      text="What's your main goal?"
      fontSize={64}
      fontWeight={800}
      fontFamily="SF Pro Display, -apple-system, sans-serif"
      fill="#ffffff"
      y={-550}
      opacity={0}
    />,
  );
  view.add(
    <Txt
      ref={subtitle1}
      text="Select the goal that matters most"
      fontSize={36}
      fontWeight={500}
      fontFamily="SF Pro Display, -apple-system, sans-serif"
      fill="rgba(255,255,255,0.35)"
      y={-480}
      opacity={0}
    />,
  );

  // Goal cards in 2x2 grid
  const goalCards = createRefArray<Rect>();
  const goalLabels = createRefArray<Txt>();
  const goalEmojis = createRefArray<Txt>();
  const goalSubs = createRefArray<Txt>();

  const gridPositions = [
    new Vector2(-170, -250),
    new Vector2(170, -250),
    new Vector2(-170, 50),
    new Vector2(170, 50),
  ];

  for (let i = 0; i < GOALS.length; i++) {
    const g = GOALS[i];
    const pos = gridPositions[i];
    view.add(
      <Rect
        ref={goalCards}
        x={pos.x}
        y={pos.y}
        width={300}
        height={260}
        radius={40}
        fill="rgba(255,255,255,0.06)"
        stroke="rgba(255,255,255,0.1)"
        lineWidth={2}
        opacity={0}
        scale={0.8}
      >
        <Txt
          ref={goalEmojis}
          text={g.emoji}
          fontSize={72}
          y={-40}
        />
        <Txt
          ref={goalLabels}
          text={g.label}
          fontSize={36}
          fontWeight={700}
          fontFamily="SF Pro Display, -apple-system, sans-serif"
          fill="#ffffff"
          y={40}
        />
        <Txt
          ref={goalSubs}
          text={g.subtitle}
          fontSize={24}
          fontWeight={500}
          fontFamily="SF Pro Display, -apple-system, sans-serif"
          fill="rgba(255,255,255,0.35)"
          y={80}
        />
      </Rect>,
    );
  }

  // Animate Act 1: title + cards appear
  yield* all(
    title1().opacity(1, 0.5, easeOutCubic),
    subtitle1().opacity(1, 0.5, easeOutCubic),
  );

  yield* sequence(
    0.1,
    ...goalCards.map((card) =>
      all(
        card.opacity(1, 0.4, easeOutCubic),
        card.scale(1, 0.5, easeOutBack),
      ),
    ),
  );

  yield* waitFor(1.5);

  // ─────── ACT 2: Title swap + split into 4 columns ───────

  const title2 = createRef<Txt>();
  const subtitle2a = createRef<Txt>();
  const subtitle2b = createRef<Txt>();

  view.add(
    <Txt
      ref={title2}
      text="Each goal gets its own flow"
      fontSize={58}
      fontWeight={800}
      fontFamily="SF Pro Display, -apple-system, sans-serif"
      fill="#ffffff"
      y={-550}
      opacity={0}
    />,
  );
  view.add(
    <Txt
      ref={subtitle2a}
      text="WITH PRO"
      fontSize={22}
      fontWeight={700}
      fontFamily="SF Pro Display, -apple-system, sans-serif"
      fill="rgba(255,255,255,0.3)"
      letterSpacing={4}
      y={-610}
      opacity={0}
    />,
  );
  view.add(
    <Txt
      ref={subtitle2b}
      text="Different timeline · Different questions · Different packages"
      fontSize={28}
      fontWeight={500}
      fontFamily="SF Pro Display, -apple-system, sans-serif"
      fill="rgba(255,255,255,0.35)"
      y={-480}
      opacity={0}
    />,
  );

  // Crossfade titles
  yield* all(
    title1().opacity(0, 0.4),
    subtitle1().opacity(0, 0.4),
  );
  yield* all(
    title2().opacity(1, 0.5, easeOutCubic),
    subtitle2a().opacity(1, 0.5, easeOutCubic),
    subtitle2b().opacity(1, 0.5, easeOutCubic),
  );

  // Move cards from 2x2 grid into 4 columns (side by side)
  const columnX = [-370, -125, 125, 370];
  const columnY = -320;

  yield* all(
    ...goalCards.map((card, i) =>
      all(
        card.position(new Vector2(columnX[i], columnY), 0.8, easeInOutCubic),
        card.width(220, 0.8, easeInOutCubic),
        card.height(180, 0.8, easeInOutCubic),
        card.radius(28, 0.8, easeInOutCubic),
      ),
    ),
    ...goalEmojis.map((e) => e.fontSize(48, 0.8, easeInOutCubic)),
    ...goalEmojis.map((e) => e.y(-25, 0.8, easeInOutCubic)),
    ...goalLabels.map((l) => l.fontSize(22, 0.8, easeInOutCubic)),
    ...goalLabels.map((l) => l.y(30, 0.8, easeInOutCubic)),
    ...goalSubs.map((s) => s.opacity(0, 0.4)),
  );

  yield* waitFor(0.3);

  // ─────── ACT 3: Steps cascade per column ───────

  // Add colour glow borders to each card
  yield* all(
    ...goalCards.map((card, i) =>
      all(
        card.stroke(GOALS[i].color + '60', 0.6, easeOutCubic),
        card.lineWidth(3, 0.6),
      ),
    ),
  );

  // Create step cards for each column
  for (let col = 0; col < GOALS.length; col++) {
    const g = GOALS[col];
    const x = columnX[col];
    let y = columnY + 120;
    const cardW = 210;

    // Timeline pill
    const timelineRect = createRef<Rect>();
    const weeksText = createRef<Txt>();
    view.add(
      <Rect
        ref={timelineRect}
        x={x} y={y} width={cardW} height={90} radius={20}
        fill={g.color + '18'} stroke={g.color + '35'} lineWidth={1.5}
        opacity={0} scale={0.9}
      >
        <Txt ref={weeksText} text={`~${g.weeks}`} fontSize={44} fontWeight={800}
          fontFamily="SF Pro Display, sans-serif" fill={g.color} y={-8} />
        <Txt text="weeks" fontSize={16} fontWeight={700}
          fontFamily="SF Pro Display, sans-serif" fill={g.color + '90'}
          y={28} letterSpacing={1} />
      </Rect>,
    );
    y += 105;

    // About You card
    const aboutRect = createRef<Rect>();
    view.add(
      <Rect
        ref={aboutRect}
        x={x} y={y} width={cardW} height={28 + g.aboutFields.length * 30} radius={16}
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)" lineWidth={1}
        opacity={0} scale={0.9}
        layout direction="column" padding={14} gap={6}
      >
        <Txt text="ABOUT YOU" fontSize={14} fontWeight={700}
          fontFamily="SF Pro Display, sans-serif" fill="rgba(255,255,255,0.35)"
          letterSpacing={1.5} />
        {g.aboutFields.map((f) => (
          <Rect key={f} width={cardW - 36} height={26} radius={8}
            fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.05)" lineWidth={1}>
            <Txt text={f} fontSize={15} fontWeight={500}
              fontFamily="SF Pro Display, sans-serif" fill="rgba(255,255,255,0.3)" />
          </Rect>
        ))}
      </Rect>,
    );
    y += 30 + g.aboutFields.length * 30 + 12;

    // Question card
    const qRect = createRef<Rect>();
    view.add(
      <Rect
        ref={qRect}
        x={x} y={y} width={cardW} height={38 + g.options.length * 28 + 24} radius={16}
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)" lineWidth={1}
        opacity={0} scale={0.9}
        layout direction="column" padding={14} gap={4}
      >
        <Txt text="QUESTION" fontSize={14} fontWeight={700}
          fontFamily="SF Pro Display, sans-serif" fill="rgba(255,255,255,0.35)"
          letterSpacing={1.5} />
        <Txt text={g.question} fontSize={16} fontWeight={600}
          fontFamily="SF Pro Display, sans-serif" fill="rgba(255,255,255,0.7)"
          width={cardW - 36} textWrap />
        {g.options.map((opt, oi) => (
          <Rect key={opt} width={cardW - 36} height={24} radius={7}
            fill={oi === 0 ? g.color + '20' : 'rgba(255,255,255,0.03)'}
            stroke={oi === 0 ? g.color + '30' : 'rgba(255,255,255,0.05)'} lineWidth={1}>
            <Txt text={opt} fontSize={14} fontWeight={600}
              fontFamily="SF Pro Display, sans-serif"
              fill={oi === 0 ? g.color : 'rgba(255,255,255,0.3)'} />
          </Rect>
        ))}
      </Rect>,
    );
    y += 38 + g.options.length * 28 + 24 + 12;

    // Specialty card
    const specRect = createRef<Rect>();
    view.add(
      <Rect
        ref={specRect}
        x={x} y={y} width={cardW} height={44} radius={14}
        fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)" lineWidth={1}
        opacity={0} scale={0.9}
        layout direction="row" padding={10} gap={8} alignItems="center"
      >
        <Rect width={24} height={24} radius={7} fill={g.color + '20'}>
          <Txt text="✓" fontSize={14} fill={g.color} fontWeight={700} />
        </Rect>
        <Txt text={g.specialty} fontSize={16} fontWeight={600}
          fontFamily="SF Pro Display, sans-serif" fill="rgba(255,255,255,0.5)" />
      </Rect>,
    );
    y += 56;

    // Package card
    const pkgRect = createRef<Rect>();
    view.add(
      <Rect
        ref={pkgRect}
        x={x} y={y} width={cardW} height={44} radius={14}
        fill={g.color + '12'} stroke={g.color + '25'} lineWidth={1}
        opacity={0} scale={0.9}
        layout direction="row" padding={[10, 14]} justifyContent="space-between" alignItems="center"
      >
        <Txt text={g.pkgName} fontSize={15} fontWeight={600}
          fontFamily="SF Pro Display, sans-serif" fill="rgba(255,255,255,0.55)" />
        <Txt text={g.pkgPrice} fontSize={17} fontWeight={800}
          fontFamily="SF Pro Display, sans-serif" fill={g.color} />
      </Rect>,
    );

    // Staggered cascade: each column starts 0.6s after the previous
    const delay = col * 0.6;
    yield* waitFor(col === 0 ? 0.2 : 0.4);

    yield* sequence(
      0.15,
      all(timelineRect().opacity(1, 0.4, easeOutCubic), timelineRect().scale(1, 0.4, easeOutBack)),
      all(aboutRect().opacity(1, 0.4, easeOutCubic), aboutRect().scale(1, 0.4, easeOutBack)),
      all(qRect().opacity(1, 0.4, easeOutCubic), qRect().scale(1, 0.4, easeOutBack)),
      all(specRect().opacity(1, 0.4, easeOutCubic), specRect().scale(1, 0.4, easeOutBack)),
      all(pkgRect().opacity(1, 0.4, easeOutCubic), pkgRect().scale(1, 0.4, easeOutBack)),
    );
  }

  yield* waitFor(1);

  // ─────── ACT 4: CTA ───────

  const ctaBg = createRef<Rect>();
  const ctaProBadge = createRef<Rect>();
  const ctaPrice = createRef<Txt>();
  const ctaUrl = createRef<Txt>();

  view.add(
    <Rect
      ref={ctaBg}
      y={820} width={380} height={70} radius={24}
      fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" lineWidth={1}
      opacity={0} scale={0.9}
      layout direction="row" gap={16} alignItems="center" justifyContent="center"
    >
      <Rect
        ref={ctaProBadge}
        width={60} height={32} radius={10}
        fill="#ffffff"
      >
        <Txt text="PRO" fontSize={14} fontWeight={800}
          fontFamily="SF Pro Display, sans-serif" fill="#0a0a0a" letterSpacing={1.5} />
      </Rect>
      <Txt
        ref={ctaPrice}
        text="£19.99/mo"
        fontSize={28}
        fontWeight={700}
        fontFamily="SF Pro Display, -apple-system, sans-serif"
        fill="#ffffff"
      />
    </Rect>,
  );
  view.add(
    <Txt
      ref={ctaUrl}
      text="fomoforms.com"
      fontSize={26}
      fontWeight={500}
      fontFamily="SF Pro Display, -apple-system, sans-serif"
      fill="rgba(255,255,255,0.35)"
      y={880}
      opacity={0}
    />,
  );

  yield* all(
    ctaBg().opacity(1, 0.5, easeOutCubic),
    ctaBg().scale(1, 0.5, easeOutBack),
    ctaUrl().opacity(1, 0.6, easeOutCubic),
  );

  yield* waitFor(3);
});
