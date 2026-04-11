'use client';

import { Trainer, Package, TimelineResult, FormData, TrainerBranding, TrainerServices, TrainerSpecialty } from '@/types';
import MilestoneTimeline from './MilestoneTimeline';
import TimelineToggles from './TimelineToggles';
import CTASection from './CTASection';

interface TimelineResultsProps {
  trainer: Trainer;
  branding: TrainerBranding;
  services: TrainerServices;
  specialties?: TrainerSpecialty[] | null;
  packages: Package[];
  result: TimelineResult;
  goalLabel: string;
  formData: FormData;
  leadId: string | null;
  isPreview?: boolean;
}

export default function TimelineResults({ trainer, branding, services, specialties: specialtiesProp, packages, result, goalLabel, formData, leadId, isPreview }: TimelineResultsProps) {
  const specialties = specialtiesProp ?? trainer.specialties ?? [];

  return (
    <div className="w-full max-w-lg mx-auto space-y-10 pb-8">
      {/* Summary */}
      <div className="text-center animate-in fade-in duration-700">
        <p className="text-sm mb-2" style={{ color: branding.color_text_muted }}>
          Your personalised timeline to
        </p>
        <p className="text-lg font-medium mb-6" style={{ color: branding.color_primary, fontFamily: 'var(--font-heading)' }}>
          {goalLabel}
        </p>
        <p className="text-sm leading-relaxed px-2" style={{ color: branding.color_text }}>
          {result.summary}
        </p>
      </div>

      {/* Narrative */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: branding.color_card, borderWidth: '1px', borderColor: branding.color_border }}>
        <p className="text-sm italic leading-relaxed" style={{ color: branding.color_text }}>
          &ldquo;{result.narrative}&rdquo;
        </p>
      </div>

      {/* Interactive Timeline Toggles */}
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
        branding={branding}
        services={services}
        packages={packages}
        trainerName={trainer.name}
      />

      {/* Coach Specialties */}
      {specialties.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-2 text-center" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>
            What&apos;s included
          </h3>
          <p className="text-sm text-center mb-5" style={{ color: branding.color_text_muted }}>
            Here&apos;s what you get when you start
          </p>
          <div className="space-y-3">
            {specialties.map((specialty: TrainerSpecialty, i: number) => (
              <div key={i} className="rounded-2xl p-4" style={{ backgroundColor: branding.color_card, borderWidth: '1px', borderColor: branding.color_border }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: branding.color_primary + '20' }}>
                    <svg className="w-4 h-4" style={{ color: branding.color_primary }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm" style={{ color: branding.color_text }}>{specialty.name}</h4>
                    <p className="text-xs leading-relaxed mt-1" style={{ color: branding.color_text_muted }}>{specialty.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      <div>
        <h3 className="text-xl font-bold mb-6 text-center" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>
          Your Journey
        </h3>
        <MilestoneTimeline milestones={result.milestones} branding={branding} />
      </div>

      {/* WhatsApp CTA */}
      <CTASection trainer={trainer} branding={branding} formData={formData} result={result} goalLabel={goalLabel} leadId={leadId} isPreview={isPreview} />
    </div>
  );
}
