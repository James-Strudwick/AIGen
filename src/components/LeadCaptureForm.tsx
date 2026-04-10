'use client';

import { useState, useEffect } from 'react';
import { TrainerBranding } from '@/types';
import PhoneInput from './PhoneInput';

interface LeadCaptureFormProps {
  branding: TrainerBranding;
  isLoading: boolean;
  onSubmit: (data: { name: string; phone: string }) => void;
}

function ProgressButton({ branding, isLoading }: { branding: TrainerBranding; isLoading: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    // Quick jump to 82%
    setProgress(10);
    const t1 = setTimeout(() => setProgress(45), 300);
    const t2 = setTimeout(() => setProgress(68), 800);
    const t3 = setTimeout(() => setProgress(82), 1500);

    // Then slowly crawl toward 95%
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + (95 - prev) * 0.05;
      });
    }, 200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, [isLoading]);

  // Snap to 100% when loading finishes
  useEffect(() => {
    if (!isLoading && progress > 0) {
      setProgress(100);
    }
  }, [isLoading, progress]);

  const displayProgress = Math.round(progress);

  return (
    <div className="w-full relative overflow-hidden rounded-xl" style={{ backgroundColor: branding.color_primary }}>
      {/* Progress fill */}
      <div
        className="absolute inset-0 rounded-xl transition-all duration-500 ease-out"
        style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          width: `${progress}%`,
        }}
      />
      <div className="relative py-3.5 text-center text-white font-semibold text-sm">
        Generating your timeline... {displayProgress}%
      </div>
    </div>
  );
}

export default function LeadCaptureForm({ branding, isLoading, onSubmit }: LeadCaptureFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const isValid = name.trim() && phone.length >= 8;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({ name: name.trim(), phone });
  };

  const inputStyle = {
    backgroundColor: branding.color_card,
    borderColor: branding.color_border,
    color: branding.color_text,
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-[1.4rem] font-bold mb-1.5 text-center" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>
        Almost there!
      </h2>
      <p className="text-sm text-center mb-6" style={{ color: branding.color_text_muted }}>
        Enter your details to see your timeline
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: branding.color_text }}>Your name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" required autoComplete="given-name"
            className="w-full rounded-xl px-4 py-3 text-base focus:outline-none transition-colors border"
            style={inputStyle} />
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: branding.color_text }}>Phone number</label>
          <PhoneInput value={phone} onChange={setPhone} style={inputStyle} />
        </div>

        {isLoading ? (
          <ProgressButton branding={branding} isLoading={isLoading} />
        ) : (
          <button type="submit" disabled={!isValid}
            className="w-full py-3.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-40 active:scale-[0.97] text-sm text-white"
            style={{ backgroundColor: branding.color_primary }}>
            Generate My Timeline
          </button>
        )}
      </form>

      <p className="text-[11px] text-center mt-4" style={{ color: branding.color_text_muted }}>
        Your data is kept private and only shared with your trainer.{' '}
        <a href="/privacy" target="_blank" className="underline underline-offset-2">Privacy policy</a>
      </p>
    </div>
  );
}
