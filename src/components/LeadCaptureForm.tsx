'use client';

import { useState } from 'react';

interface LeadCaptureFormProps {
  primaryColor: string;
  isLoading: boolean;
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
}

export default function LeadCaptureForm({ primaryColor, isLoading, onSubmit }: LeadCaptureFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const isValid = name.trim() && email.trim() && email.includes('@');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim() });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Almost there!
      </h2>
      <p className="text-gray-400 text-center mb-8">
        Where should we send your personalised timeline?
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-gray-300 text-sm block mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div>
          <label className="text-gray-300 text-sm block mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div>
          <label className="text-gray-300 text-sm block mb-1.5">
            Phone <span className="text-gray-600">(optional)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+44 7700 000000"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full py-3.5 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2"
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

      <p className="text-gray-600 text-xs text-center mt-4">
        Your data is kept private and only shared with your trainer
      </p>
    </div>
  );
}
