'use client';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  primaryColor: string;
}

export default function ProgressIndicator({ currentStep, totalSteps, primaryColor }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center gap-2 w-full max-w-xs mx-auto mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className="h-1.5 flex-1 rounded-full transition-all duration-500 ease-out"
          style={{
            backgroundColor: i < currentStep ? primaryColor : 'rgba(255,255,255,0.15)',
            transform: i < currentStep ? 'scaleY(1)' : 'scaleY(0.8)',
          }}
        />
      ))}
    </div>
  );
}
