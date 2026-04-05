'use client';

import { Milestone } from '@/types';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  primaryColor: string;
}

export default function MilestoneTimeline({ milestones, primaryColor }: MilestoneTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div
        className="absolute left-4 top-0 bottom-0 w-0.5 opacity-30"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="space-y-8">
        {milestones.map((milestone, i) => (
          <div
            key={i}
            className="relative pl-12 animate-in fade-in slide-in-from-left-4"
            style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}
          >
            {/* Node */}
            <div
              className="absolute left-2 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
              style={{
                borderColor: primaryColor,
                backgroundColor: i === milestones.length - 1 ? primaryColor : 'transparent',
              }}
            >
              {i === milestones.length - 1 && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: primaryColor + '20', color: primaryColor }}
                >
                  Week {milestone.weeks}
                </span>
              </div>
              <h4 className="text-white font-semibold text-lg">{milestone.label}</h4>
              <p className="text-gray-400 text-sm leading-relaxed mt-1">
                {milestone.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
