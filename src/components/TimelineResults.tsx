'use client';

import { Trainer, Package, TimelineResult, FormData, TrainerSpecialty } from '@/types';
import MilestoneTimeline from './MilestoneTimeline';
import TimelineToggles from './TimelineToggles';
import CTASection from './CTASection';

interface TimelineResultsProps {
  trainer: Trainer;
  packages: Package[];
  result: TimelineResult;
  goalLabel: string;
  formData: FormData;
}

export default function TimelineResults({ trainer, result, goalLabel, formData }: TimelineResultsProps) {
  const specialties = trainer.specialties || [];

  return (
    <div className="w-full max-w-lg mx-auto space-y-10 pb-8">
      {/* Section A — Summary */}
      <div className="text-center animate-in fade-in duration-700">
        <p className="text-gray-400 text-sm mb-2">
          Your personalised timeline to
        </p>
        <p className="text-lg font-medium mb-6" style={{ color: trainer.brand_color_primary }}>
          {goalLabel}
        </p>

        <p className="text-gray-300 leading-relaxed text-sm px-2">
          {result.summary}
        </p>
      </div>

      {/* Narrative */}
      <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/5">
        <p className="text-gray-300 leading-relaxed text-sm italic">
          &ldquo;{result.narrative}&rdquo;
        </p>
      </div>

      {/* Section B — Interactive Timeline Toggles */}
      <TimelineToggles
        baseInput={{
          goalType: formData.goalType!,
          currentWeightKg: formData.currentWeight,
          goalWeightKg: formData.goalWeight,
          age: formData.age,
          experienceLevel: formData.experienceLevel!,
          availableDays: formData.availableDays,
        }}
        baseWeeks={result.estimatedWeeks}
        primaryColor={trainer.brand_color_primary}
        trainerName={trainer.name}
      />

      {/* Coach Specialties */}
      {specialties.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-2 text-center">
            Why {trainer.name}?
          </h3>
          <p className="text-gray-500 text-sm text-center mb-5">
            What you get when you train with {trainer.name}
          </p>
          <div className="space-y-3">
            {specialties.map((specialty: TrainerSpecialty, i: number) => (
              <div
                key={i}
                className="rounded-2xl p-4 bg-white/[0.03] border border-white/5"
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
                    <h4 className="text-white font-semibold text-sm">{specialty.name}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed mt-1">
                      {specialty.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section C — Milestones */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6 text-center">
          Your Journey
        </h3>
        <MilestoneTimeline
          milestones={result.milestones}
          primaryColor={trainer.brand_color_primary}
        />
      </div>

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
