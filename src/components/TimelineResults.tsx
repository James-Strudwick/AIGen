'use client';

import { Trainer, Package, TimelineResult } from '@/types';
import MilestoneTimeline from './MilestoneTimeline';
import PackageComparison from './PackageComparison';
import CTASection from './CTASection';

interface TimelineResultsProps {
  trainer: Trainer;
  packages: Package[];
  result: TimelineResult;
  goalLabel: string;
}

export default function TimelineResults({ trainer, result, goalLabel }: TimelineResultsProps) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-10">
      {/* Section A — Summary */}
      <div className="text-center animate-in fade-in duration-700">
        <p className="text-gray-400 text-sm mb-2">
          Based on your details, here&apos;s your realistic timeline to
        </p>
        <p className="text-lg font-medium mb-4" style={{ color: trainer.brand_color_primary }}>
          {goalLabel}
        </p>

        <div
          className="inline-block rounded-2xl px-8 py-5 mb-6"
          style={{ backgroundColor: trainer.brand_color_primary + '15' }}
        >
          <p className="text-4xl font-bold text-white">
            ~{result.estimatedWeeks} weeks
          </p>
          <p className="text-gray-400 text-sm mt-1">
            approximately {Math.round(result.estimatedWeeks / 4.33)} months
          </p>
        </div>

        <p className="text-gray-300 leading-relaxed text-sm">
          {result.summary}
        </p>
      </div>

      {/* Narrative */}
      <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/5">
        <p className="text-gray-300 leading-relaxed text-sm italic">
          &ldquo;{result.narrative}&rdquo;
        </p>
      </div>

      {/* Section B — Milestones */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6 text-center">
          Your Journey
        </h3>
        <MilestoneTimeline
          milestones={result.milestones}
          primaryColor={trainer.brand_color_primary}
        />
      </div>

      {/* Section C — Package Comparison */}
      {result.packageComparisons.length > 0 && (
        <PackageComparison
          packages={result.packageComparisons}
          trainerName={trainer.name}
          primaryColor={trainer.brand_color_primary}
        />
      )}

      {/* Section D — CTA */}
      <CTASection trainer={trainer} />
    </div>
  );
}
