'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Trainer, Package, FormData, GoalType, ExperienceLevel, TimelineResult, TrainerBranding, TrainerForm } from '@/types';
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
  forms?: TrainerForm[];
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

export default function TrainerPage({ trainer, packages, forms = [], isPreview = false }: TrainerPageProps) {
  // formSteps is computed later after activeForm is resolved

  const branding = useMemo(() => resolveBranding(trainer), [trainer]);
  const services = useMemo(() => resolveServices(trainer), [trainer]);
  const copy = useMemo(() => resolveCopy(trainer), [trainer]);
  const cssVars = useMemo(() => brandingToCssVars(branding), [branding]);
  const fontsUrl = useMemo(() => getGoogleFontsUrl(branding), [branding]);
  const trainerSpecialties = trainer.specialties ?? [];

  const [step, setStep] = useState<Step>('hero');
  const [isLoading, setIsLoading] = useState(false);
  const [activeForm, setActiveForm] = useState<TrainerForm | null>(null);
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
    customAboutFields: {},
    customAnswers: {},
    name: '',
    phone: '',
  });

  // Resolve form-specific overrides (custom form > default trainer settings)
  const activeQuestions = activeForm?.questions ?? trainer.custom_questions ?? [];
  const activePackages = activeForm?.packages
    ? activeForm.packages.map((p, i) => ({ ...p, id: `form-pkg-${i}`, trainer_id: trainer.id, description: null, sort_order: i + 1 } as Package))
    : packages;
  const activeServices = activeForm?.services ?? services;
  const activeSpecialties = activeForm?.specialties ?? trainerSpecialties;
  const activeCopy = {
    hero_headline: activeForm?.copy?.hero_headline || copy.hero_headline,
    hero_subtext: activeForm?.copy?.hero_subtext || copy.hero_subtext,
    cta_button_text: activeForm?.copy?.cta_button_text || copy.cta_button_text,
    tone: activeForm?.copy?.tone || copy.tone,
  };
  const hasCustomQuestions = activeQuestions.length > 0;

  const formSteps: Step[] = useMemo(() => {
    const steps: Step[] = ['goal', 'about', 'availability'];
    if (hasCustomQuestions) steps.push('questions');
    steps.push('capture');
    return steps;
  }, [hasCustomQuestions]);

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
        formId: activeForm?.id || null,
      }),
    }).catch(() => {});
  }, [trainer.id, isPreview, activeForm]);

  // Track step entries
  useEffect(() => {
    trackStep(step, 'entered');
  }, [step, trackStep]);

  const handleGoalSelect = useCallback((goal: GoalType, performanceTarget?: string) => {
    trackStep('goal', 'completed');
    setFormData((prev) => ({ ...prev, goalType: goal, performanceTarget }));

    // Find matching custom form for this goal (from custom_goals id)
    const goalId = (trainer.custom_goals || []).find(g => g.goal_type === goal)?.id || goal;
    const matchedForm = forms.find(f => f.goal_id === goalId) || null;
    setActiveForm(matchedForm);

    setStep('about');
  }, [trackStep, forms, trainer.custom_goals]);

  const handleAboutSubmit = useCallback((data: {
    age: number | null;
    currentWeight: number | null;
    goalWeight: number | null;
    weightUnit: 'kg' | 'stone';
    experienceLevel: ExperienceLevel | null;
    customAboutFields: Record<string, string>;
  }) => {
    setFormData((prev) => ({
      ...prev,
      age: data.age,
      currentWeight: data.currentWeight,
      goalWeight: data.goalWeight,
      weightUnit: data.weightUnit,
      experienceLevel: data.experienceLevel,
      customAboutFields: data.customAboutFields,
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
          trainerSpecialties: activeSpecialties,
          trainerTone: activeCopy.tone,
          serviceAddOns: activeServices.add_ons,
          customQuestions: activeQuestions,
          formId: activeForm?.id || null,
          formData: updatedForm,
          packages: activePackages,
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
  }, [formData, trainer, packages, isPreview, activeForm, activeSpecialties, activeCopy.tone, activeServices.add_ons, activeQuestions, activePackages]);

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
        <PoweredByBadge branding={branding} tier={trainer.tier} />
      </>
    );
  }

  if (step === 'results' && result) {
    return pageWrapper(
      <div className="py-10 px-4">
        <TimelineResults
          trainer={trainer}
          branding={branding}
          services={activeServices}
          specialties={activeSpecialties}
          packages={activePackages}
          result={result}
          goalLabel={getGoalLabel(formData)}
          formData={formData}
          leadId={leadId}
          isPreview={isPreview}
        />
        <PoweredByBadge branding={branding} tier={trainer.tier} />
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
          <AboutYouForm
            goalType={formData.goalType}
            branding={branding}
            customFields={[]}
            onSubmit={handleAboutSubmit}
          />
        )}

        {step === 'availability' && (
          <AvailabilitySelector branding={branding} onSelect={handleAvailabilitySelect} />
        )}

        {step === 'questions' && activeQuestions.length > 0 && (
          <CustomQuestions
            questions={activeQuestions}
            branding={branding}
            onSubmit={handleCustomAnswers}
          />
        )}

        {step === 'capture' && (
          <LeadCaptureForm branding={branding} isLoading={isLoading} onSubmit={handleLeadSubmit} />
        )}
      </div>

      <PoweredByBadge branding={branding} tier={trainer.tier} />
    </div>
  );
}
