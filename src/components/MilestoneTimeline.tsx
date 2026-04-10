'use client';

import { Milestone, TrainerBranding } from '@/types';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  branding: TrainerBranding;
}

export default function MilestoneTimeline({ milestones, branding }: MilestoneTimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 opacity-30" style={{ backgroundColor: branding.color_primary }} />

      <div className="space-y-8">
        {milestones.map((milestone, i) => (
          <div key={i} className="relative pl-12 animate-in fade-in slide-in-from-left-4"
            style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
            <div className="absolute left-2 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
              style={{
                borderColor: branding.color_primary,
                backgroundColor: i === milestones.length - 1 ? branding.color_primary : 'transparent',
              }}>
              {i === milestones.length - 1 && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: branding.color_primary + '20', color: branding.color_primary }}>
                Week {milestone.weeks}
              </span>
              <h4 className="font-semibold text-lg mt-1" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>{milestone.label}</h4>
              <p className="text-sm leading-relaxed mt-1" style={{ color: branding.color_text_muted }}>{milestone.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
