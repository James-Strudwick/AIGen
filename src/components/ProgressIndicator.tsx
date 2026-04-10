'use client';

import { TrainerBranding } from '@/types';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  branding: TrainerBranding;
}

export default function ProgressIndicator({ currentStep, totalSteps, branding }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-2 w-full max-w-xs mx-auto mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className="h-1.5 flex-1 rounded-full transition-all duration-500 ease-out"
          style={{
            backgroundColor: i < currentStep ? branding.color_primary : branding.color_border,
            transform: i < currentStep ? 'scaleY(1)' : 'scaleY(0.8)',
          }}
        />
      ))}
    </div>
  );
}
