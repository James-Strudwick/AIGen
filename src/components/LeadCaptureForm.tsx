'use client';

import { useState } from 'react';

interface LeadCaptureFormProps {
  primaryColor: string;
  isLoading: boolean;
  onSubmit: (data: { name: string; phone: string }) => void;
}

export default function LeadCaptureForm({ primaryColor, isLoading, onSubmit }: LeadCaptureFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const isValid = name.trim() && phone.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({ name: name.trim(), phone: phone.trim() });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-[1.4rem] font-bold text-white mb-1.5 text-center">
        Almost there!
      </h2>
      <p className="text-gray-400 text-sm text-center mb-6">
        Enter your details to see your timeline
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-gray-300 text-xs font-medium block mb-1.5">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name"
            required
            autoComplete="given-name"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div>
          <label className="text-gray-300 text-xs font-medium block mb-1.5">Phone number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+44 7700 000000"
            required
            autoComplete="tel"
            inputMode="tel"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full py-3.5 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2 active:scale-[0.97] text-sm"
          style={{ backgroundColor: primaryColor }}
        >
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

      <p className="text-gray-600 text-[11px] text-center mt-4">
        Your data is kept private and only shared with your trainer
      </p>
    </div>
  );
}
