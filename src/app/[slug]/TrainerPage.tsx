'use client';

import { useState, useCallback, useMemo } from 'react';
import { Trainer, Package, FormData, GoalType, ExperienceLevel, TimelineResult, TrainerBranding } from '@/types';
import { resolveBranding, brandingToCssVars, getGoogleFontsUrl, resolveServices, resolveCopy } from '@/lib/branding';
import HeroSection from '@/components/HeroSection';
import GoalSelector from '@/components/GoalSelector';
import AboutYouForm from '@/components/AboutYouForm';
import AvailabilitySelector from '@/components/AvailabilitySelector';
import CustomQuestions from '@/components/CustomQuestions';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import TimelineResults from '@/components/TimelineResults';
import ProgressIndicator from '@/components/ProgressIndicator';

interface TrainerPageProps {
  trainer: Trainer;
  packages: Package[];
}

function getGoalLabel(formData: FormData): string {
  if (!formData.goalType) return '';
  if ((formData.goalType === 'fitness' || formData.goalType === 'performance') && formData.performanceTarget) {
    return formData.performanceTarget;
  }
  const labels: Record<GoalType, string> = {
    weight_loss: 'Lose Weight',
    muscle_gain: 'Build Muscle',
    fitness: 'Improve Fitness',
    performance: 'Performance Goal',
  };
  return labels[formData.goalType];
}

type Step = 'hero' | 'goal' | 'about' | 'availability' | 'questions' | 'capture' | 'results';

export default function TrainerPage({ trainer, packages }: TrainerPageProps) {
  const hasCustomQuestions = (trainer.custom_questions?.length ?? 0) > 0;
  const formSteps: Step[] = useMemo(() => {
    const steps: Step[] = ['goal', 'about', 'availability'];
    if (hasCustomQuestions) steps.push('questions');
    steps.push('capture');
    return steps;
  }, [hasCustomQuestions]);

  const branding = useMemo(() => resolveBranding(trainer), [trainer]);
  const services = useMemo(() => resolveServices(trainer), [trainer]);
  const copy = useMemo(() => resolveCopy(trainer), [trainer]);
  const cssVars = useMemo(() => brandingToCssVars(branding), [branding]);
  const fontsUrl = useMemo(() => getGoogleFontsUrl(branding), [branding]);

  const [step, setStep] = useState<Step>('hero');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TimelineResult | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    goalType: null,
    age: null,
    currentWeight: null,
    goalWeight: null,
    weightUnit: 'kg',
    experienceLevel: null,
    availableDays: 3,
    customAnswers: {},
    name: '',
    phone: '',
  });

  const currentFormStep = formSteps.indexOf(step) + 1;

  const handleGoalSelect = useCallback((goal: GoalType, performanceTarget?: string) => {
    setFormData((prev) => ({ ...prev, goalType: goal, performanceTarget }));
    setStep('about');
  }, []);

  const handleAboutSubmit = useCallback((data: {
    age: number;
    currentWeight: number;
    goalWeight: number | null;
    weightUnit: 'kg' | 'stone';
    experienceLevel: ExperienceLevel;
  }) => {
    setFormData((prev) => ({
      ...prev,
      age: data.age,
      currentWeight: data.currentWeight,
      goalWeight: data.goalWeight,
      weightUnit: data.weightUnit,
      experienceLevel: data.experienceLevel,
    }));
    setStep('availability');
  }, []);

  const handleAvailabilitySelect = useCallback((days: number) => {
    setFormData((prev) => ({ ...prev, availableDays: days }));
    setStep(hasCustomQuestions ? 'questions' : 'capture');
  }, [hasCustomQuestions]);

  const handleCustomAnswers = useCallback((answers: Record<string, string | string[]>) => {
    setFormData((prev) => ({ ...prev, customAnswers: answers }));
    setStep('capture');
  }, []);

  const handleLeadSubmit = useCallback(async (data: { name: string; phone: string }) => {
    setIsLoading(true);
    const updatedForm = { ...formData, ...data };
    setFormData(updatedForm);

    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainerId: trainer.id,
          trainerName: trainer.name,
          trainerBio: trainer.bio,
          trainerSpecialties: trainer.specialties,
          trainerTone: copy.tone,
          serviceAddOns: services.add_ons,
          customQuestions: trainer.custom_questions || [],
          formData: updatedForm,
          packages: packages,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      const data = await response.json();
      const { leadId: newLeadId, ...timeline } = data;
      setResult(timeline as TimelineResult);
      setLeadId(newLeadId || null);
      setStep('results');
    } catch (err) {
      console.error('Error submitting lead:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, trainer, packages]);

  // Wrap everything in a div that sets CSS custom properties for the branding
  const pageWrapper = (children: React.ReactNode, extraClass?: string) => (
    <>
      {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
      <div
        className={`min-h-[100dvh] ${extraClass || ''}`}
        style={{
          ...cssVars,
          backgroundColor: 'var(--brand-bg)',
          color: 'var(--brand-text)',
          fontFamily: 'var(--font-body)',
        } as React.CSSProperties}
      >
        {children}
      </div>
    </>
  );

  if (step === 'hero') {
    return pageWrapper(
      <HeroSection trainer={trainer} branding={branding} copy={copy} onStart={() => setStep('goal')} />
    );
  }

  if (step === 'results' && result) {
    return pageWrapper(
      <div className="py-10 px-4">
        <TimelineResults
          trainer={trainer}
          branding={branding}
          services={services}
          packages={packages}
          result={result}
          goalLabel={getGoalLabel(formData)}
          formData={formData}
          leadId={leadId}
        />
      </div>
    );
  }

  return pageWrapper(
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 py-10">
      <ProgressIndicator
        currentStep={currentFormStep}
        totalSteps={formSteps.length}
        branding={branding}
      />

      <div className="w-full transition-all duration-300">
        {step === 'goal' && (
          <GoalSelector branding={branding} onSelect={handleGoalSelect} />
        )}

        {step === 'about' && formData.goalType && (
          <AboutYouForm goalType={formData.goalType} branding={branding} onSubmit={handleAboutSubmit} />
        )}

        {step === 'availability' && (
          <AvailabilitySelector branding={branding} onSelect={handleAvailabilitySelect} />
        )}

        {step === 'questions' && trainer.custom_questions && (
          <CustomQuestions
            questions={trainer.custom_questions}
            branding={branding}
            onSubmit={handleCustomAnswers}
          />
        )}

        {step === 'capture' && (
          <LeadCaptureForm branding={branding} isLoading={isLoading} onSubmit={handleLeadSubmit} />
        )}
      </div>
    </div>
  );
}
