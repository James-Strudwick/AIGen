'use client';

import { Trainer, Package, TimelineResult, FormData, GoalType, TrainerSpecialty } from '@/types';
import MilestoneTimeline from './MilestoneTimeline';
import PackageComparison from './PackageComparison';
import CTASection from './CTASection';

interface TimelineResultsProps {
  trainer: Trainer;
  packages: Package[];
  result: TimelineResult;
  goalLabel: string;
  formData: FormData;
}

function getRelevantSpecialties(specialties: TrainerSpecialty[] | null, goalType: GoalType | null): TrainerSpecialty[] {
  if (!specialties || !goalType) return [];
  return specialties.filter((s) => s.goal_types.includes(goalType));
}

export default function TimelineResults({ trainer, result, goalLabel, formData }: TimelineResultsProps) {
  const relevantSpecialties = getRelevantSpecialties(trainer.specialties, formData.goalType);

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

      {/* Coach Specialties — how they accelerate YOUR goal */}
      {relevantSpecialties.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-2 text-center">
            How {trainer.name} gets you there faster
          </h3>
          <p className="text-gray-500 text-sm text-center mb-6">
            Specific expertise that accelerates your {goalLabel.toLowerCase()} goal
          </p>
          <div className="space-y-3">
            {relevantSpecialties.map((specialty, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 bg-white/[0.03] border border-white/5 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: trainer.brand_color_primary + '20' }}
                  >
                    <svg className="w-4 h-4" style={{ color: trainer.brand_color_primary }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{specialty.name}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed mt-1">
                      {specialty.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Section D — WhatsApp CTA */}
      <CTASection
        trainer={trainer}
        formData={formData}
        result={result}
        goalLabel={goalLabel}
      />
    </div>
  );
}
