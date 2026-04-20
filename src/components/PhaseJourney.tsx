'use client';

import { GoalType, TrainerBranding } from '@/types';

interface PhaseJourneyProps {
  goalType: GoalType;
  goalLabel: string;
  branding: TrainerBranding;
}

interface Phase {
  title: string;
  description: string;
  icon: string;
}

const FITNESS_PHASES: Phase[] = [
  {
    title: 'Building your foundation',
    description: 'Establishing baseline fitness, movement quality, and training consistency. Your body adapts to the new routine and habits start to form.',
    icon: '🏗️',
  },
  {
    title: 'Building endurance & strength',
    description: 'Progressive overload kicks in. Sessions feel easier, recovery improves, and you start noticing real changes in how you move and feel day-to-day.',
    icon: '📈',
  },
  {
    title: 'Peak fitness & confidence',
    description: 'You\'re training with purpose and seeing measurable progress. Energy is up, strength is up, and the goal feels within reach.',
    icon: '🔥',
  },
  {
    title: 'Goal achieved — what\'s next?',
    description: 'You\'ve hit the level you set out to reach. Time for a reassessment to measure your progress, celebrate the wins, and map out your next phase of training.',
    icon: '🎯',
  },
];

const PERFORMANCE_PHASES: Phase[] = [
  {
    title: 'Base conditioning',
    description: 'Building the physical foundation your goal demands. Developing the strength, mobility, and work capacity needed for what comes next.',
    icon: '🏗️',
  },
  {
    title: 'Skill development',
    description: 'Technique improves alongside fitness. Structured progressions targeting your specific goal, with measurable benchmarks along the way.',
    icon: '⚙️',
  },
  {
    title: 'Performance push',
    description: 'Intensity increases, training gets specific, and you start operating at the level your goal requires. This is where the real work happens.',
    icon: '⚡',
  },
  {
    title: 'Target reached — reassess & evolve',
    description: 'You\'ve put in the work and arrived. Now we reassess where you are, review what worked, and build your next training block based on where you want to go from here.',
    icon: '🏆',
  },
];

function getPhasesForGoal(goalType: GoalType): Phase[] {
  switch (goalType) {
    case 'fitness':
      return FITNESS_PHASES;
    case 'performance':
      return PERFORMANCE_PHASES;
    default:
      return FITNESS_PHASES;
  }
}

export default function PhaseJourney({ goalType, goalLabel, branding }: PhaseJourneyProps) {
  const phases = getPhasesForGoal(goalType);

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-2 text-center" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>
        Your journey to {goalLabel.toLowerCase()}
      </h3>
      <p className="text-sm text-center mb-8" style={{ color: branding.color_text_muted }}>
        Here&apos;s what the path looks like
      </p>

      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5" style={{ backgroundColor: branding.color_border }} />

        <div className="space-y-0">
          {phases.map((phase, i) => {
            const isLast = i === phases.length - 1;
            return (
              <div key={i} className="relative flex gap-4 pb-6">
                {/* Phase dot */}
                <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg"
                  style={{
                    backgroundColor: isLast ? branding.color_primary + '20' : branding.color_card,
                    borderWidth: '2px',
                    borderColor: isLast ? branding.color_primary : branding.color_border,
                  }}>
                  {phase.icon}
                </div>

                {/* Phase content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: branding.color_text_muted }}>
                      Phase {i + 1}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: branding.color_text }}>
                    {phase.title}
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: branding.color_text_muted }}>
                    {phase.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
