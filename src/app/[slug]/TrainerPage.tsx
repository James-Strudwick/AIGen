'use client';

import { useState, useCallback } from 'react';
import { Trainer, Package, FormData, GoalType, ExperienceLevel, TimelineResult } from '@/types';
import HeroSection from '@/components/HeroSection';
import GoalSelector from '@/components/GoalSelector';
import AboutYouForm from '@/components/AboutYouForm';
import AvailabilitySelector from '@/components/AvailabilitySelector';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import TimelineResults from '@/components/TimelineResults';
import ProgressIndicator from '@/components/ProgressIndicator';

interface TrainerPageProps {
  trainer: Trainer;
  packages: Package[];
}

const goalLabels: Record<GoalType, string> = {
  weight_loss: 'Lose Weight',
  muscle_gain: 'Build Muscle',
  fitness: 'Improve Fitness',
  performance: 'Performance Goal',
};

type Step = 'hero' | 'goal' | 'about' | 'availability' | 'capture' | 'results';
const formSteps: Step[] = ['goal', 'about', 'availability', 'capture'];

export default function TrainerPage({ trainer, packages }: TrainerPageProps) {
  const [step, setStep] = useState<Step>('hero');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TimelineResult | null>(null);
  const [formData, setFormData] = useState<FormData>({
    goalType: null,
    age: null,
    currentWeight: null,
    goalWeight: null,
    weightUnit: 'kg',
    experienceLevel: null,
    availableDays: 3,
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
          formData: updatedForm,
          packages: packages,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      const timeline: TimelineResult = await response.json();
      setResult(timeline);
      setStep('results');
    } catch (err) {
      console.error('Error submitting lead:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, trainer, packages]);

  if (step === 'hero') {
    return <HeroSection trainer={trainer} onStart={() => setStep('goal')} />;
  }

  if (step === 'results' && result) {
    return (
      <div
        className="min-h-screen py-12 px-5"
        style={{ backgroundColor: trainer.brand_color_secondary }}
      >
        <TimelineResults
          trainer={trainer}
          packages={packages}
          result={result}
          goalLabel={formData.goalType ? goalLabels[formData.goalType] : ''}
          formData={formData}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
      style={{ backgroundColor: trainer.brand_color_secondary }}
    >
      <ProgressIndicator
        currentStep={currentFormStep}
        totalSteps={formSteps.length}
        primaryColor={trainer.brand_color_primary}
      />

      <div className="w-full transition-all duration-300">
        {step === 'goal' && (
          <GoalSelector
            primaryColor={trainer.brand_color_primary}
            onSelect={handleGoalSelect}
          />
        )}

        {step === 'about' && formData.goalType && (
          <AboutYouForm
            goalType={formData.goalType}
            primaryColor={trainer.brand_color_primary}
            onSubmit={handleAboutSubmit}
          />
        )}

        {step === 'availability' && (
          <AvailabilitySelector
            primaryColor={trainer.brand_color_primary}
            onSelect={handleAvailabilitySelect}
          />
        )}

        {step === 'capture' && (
          <LeadCaptureForm
            primaryColor={trainer.brand_color_primary}
            isLoading={isLoading}
            onSubmit={handleLeadSubmit}
          />
        )}
      </div>
    </div>
  );
}
