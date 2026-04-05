'use client';

import { useState } from 'react';
import { TrainerBranding } from '@/types';

interface LeadCaptureFormProps {
  branding: TrainerBranding;
  isLoading: boolean;
  onSubmit: (data: { name: string; phone: string }) => void;
}

export default function LeadCaptureForm({ branding, isLoading, onSubmit }: LeadCaptureFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const isValid = name.trim() && phone.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({ name: name.trim(), phone: phone.trim() });
  };

  const inputStyle = {
    backgroundColor: branding.color_card,
    borderWidth: '1px',
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
            className="w-full rounded-xl px-4 py-3 text-base focus:outline-none transition-colors" style={inputStyle} />
        </div>

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: branding.color_text }}>Phone number</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+44 7700 000000" required autoComplete="tel" inputMode="tel"
            className="w-full rounded-xl px-4 py-3 text-base focus:outline-none transition-colors" style={inputStyle} />
        </div>

        <button type="submit" disabled={!isValid || isLoading}
          className="w-full py-3.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2 active:scale-[0.97] text-sm text-white"
          style={{ backgroundColor: branding.color_primary }}>
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Your Timeline...
            </>
          ) : (
            'Generate My Timeline'
          )}
        </button>
      </form>

      <p className="text-[11px] text-center mt-4" style={{ color: branding.color_text_muted }}>
        Your data is kept private and only shared with your trainer
      </p>
    </div>
  );
}
