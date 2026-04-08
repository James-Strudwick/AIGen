'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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
import PoweredByBadge from '@/components/PoweredByBadge';

interface TrainerPageProps {
  trainer: Trainer;
  packages: Package[];
  isPreview?: boolean;
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

export default function TrainerPage({ trainer, packages, isPreview = false }: TrainerPageProps) {
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

  // Analytics tracking
  const sessionIdRef = useRef(() => {
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('fomo_session');
      if (!id) { id = crypto.randomUUID(); sessionStorage.setItem('fomo_session', id); }
      return id;
    }
    return 'ssr';
  });

  const trackStep = useCallback((stepName: string, action: 'entered' | 'completed') => {
    if (isPreview) return;
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trainerId: trainer.id,
        sessionId: sessionIdRef.current(),
        step: stepName,
        action,
      }),
    }).catch(() => {});
  }, [trainer.id, isPreview]);

  // Track step entries
  useEffect(() => {
    trackStep(step, 'entered');
  }, [step, trackStep]);

  const handleGoalSelect = useCallback((goal: GoalType, performanceTarget?: string) => {
    trackStep('goal', 'completed');
    setFormData((prev) => ({ ...prev, goalType: goal, performanceTarget }));
    setStep('about');
  }, [trackStep]);

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
    trackStep('about', 'completed');
    setStep('availability');
  }, [trackStep]);

  const handleAvailabilitySelect = useCallback((days: number) => {
    setFormData((prev) => ({ ...prev, availableDays: days }));
    trackStep('availability', 'completed');
    setStep(hasCustomQuestions ? 'questions' : 'capture');
  }, [hasCustomQuestions, trackStep]);

  const handleCustomAnswers = useCallback((answers: Record<string, string | string[]>) => {
    trackStep('questions', 'completed');
    setFormData((prev) => ({ ...prev, customAnswers: answers }));
    setStep('capture');
  }, [trackStep]);

  const handleLeadSubmit = useCallback(async (data: { name: string; phone: string }) => {
    trackStep('capture', 'completed');
    setIsLoading(true);
    const updatedForm = { ...formData, ...data };
    setFormData(updatedForm);

    if (isPreview) {
      // Preview mode — generate mock results without API call or saving
      const { calculateBaseWeeks, calculatePackageTimelines, generateBaseMilestones } = await import('@/lib/calculateTimeline');
      const calcInput = {
        goalType: updatedForm.goalType!,
        currentWeightKg: updatedForm.currentWeight,
        goalWeightKg: updatedForm.goalWeight,
        age: updatedForm.age,
        experienceLevel: updatedForm.experienceLevel!,
        availableDays: updatedForm.availableDays,
      };
      const weeks = calculateBaseWeeks(calcInput);
      const pkgComparisons = calculatePackageTimelines(calcInput, packages);
      const milestones = generateBaseMilestones(updatedForm.goalType!, weeks);

      setResult({
        estimatedWeeks: weeks,
        summary: `${updatedForm.name}, this is a preview of your personalised timeline. In the live version, AI will generate a bespoke narrative based on your details and ${trainer.name}'s expertise.`,
        narrative: `This is placeholder text for the AI-generated narrative. When a real prospect fills out your form, Claude AI will write a personalised journey description referencing their specific goals, experience level, and how your coaching accelerates their results.`,
        milestones,
        packageComparisons: pkgComparisons,
      });
      setLeadId(null);
      setStep('results');
      setIsLoading(false);
      return;
    }

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

      const respData = await response.json();
      const { leadId: newLeadId, ...timeline } = respData;
      setResult(timeline as TimelineResult);
      setLeadId(newLeadId || null);
      setStep('results');
    } catch (err) {
      console.error('Error submitting lead:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, trainer, packages, isPreview, copy.tone, services.add_ons]);

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
      <>
        <HeroSection trainer={trainer} branding={branding} copy={copy} onStart={() => { trackStep('hero', 'completed'); setStep('goal'); }} />
        <PoweredByBadge branding={branding} />
      </>
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
          isPreview={isPreview}
        />
        <PoweredByBadge branding={branding} />
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
          <GoalSelector branding={branding} customGoals={trainer.custom_goals} onSelect={handleGoalSelect} />
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

      <PoweredByBadge branding={branding} />
    </div>
  );
}
