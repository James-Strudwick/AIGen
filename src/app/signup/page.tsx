'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/auth';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [referralCode] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('ref') || '';
    }
    return '';
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createBrowserClient();

      // Create auth user — email confirmation link points back to /auth/callback
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Signup failed');

      // Create trainer record via API (uses service role). Safe to run before
      // email confirmation — the userId is already assigned.
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authData.user.id,
          name,
          email,
          referralCode,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create trainer profile');
      }

      // If Supabase returned a session, email confirmation is disabled — go
      // straight to the dashboard. Otherwise, show the "check your email" card.
      if (authData.session) {
        window.location.href = '/dashboard';
      } else {
        setAwaitingConfirmation(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-4 py-3 text-[#1a1a1a] text-base placeholder-[#8e8e93] focus:outline-none focus:border-[#8e8e93]";

  if (awaitingConfirmation) {
    return (
      <div className="min-h-[100dvh] bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-5 text-2xl">
            📧
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Check your email</h1>
          <p className="text-[#8e8e93] text-sm leading-relaxed mb-6">
            We sent a confirmation link to<br />
            <span className="text-[#1a1a1a] font-medium">{email}</span>
          </p>
          <p className="text-[#8e8e93] text-xs leading-relaxed mb-6">
            Click the link in the email to finish setting up your account. It may take a minute to arrive — check your spam folder if you don&apos;t see it.
          </p>
          <Link href="/login" className="block w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm transition-all active:scale-[0.97]">
            Back to log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center tracking-tight mb-1">Create your account</h1>
        <p className="text-[#8e8e93] text-sm text-center mb-8">
          Set up your branded goal calculator in minutes
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-[#8e8e93] text-xs block mb-1">Your name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Alex Thompson" required autoComplete="name" className={inputClass} />
          </div>
          <div>
            <label className="text-[#8e8e93] text-xs block mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required autoComplete="email" className={inputClass} />
          </div>
          <div>
            <label className="text-[#8e8e93] text-xs block mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters" required minLength={6} autoComplete="new-password" className={inputClass} />
          </div>

          <label className="flex items-start gap-3 py-1">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded" />
            <span className="text-xs text-[#8e8e93] leading-relaxed">
              I agree to the{' '}
              <Link href="/terms" target="_blank" className="text-[#007AFF] underline underline-offset-2">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" target="_blank" className="text-[#007AFF] underline underline-offset-2">Privacy Policy</Link>
            </span>
          </label>

          {error && (
            <p className="text-[#FF3B30] text-sm bg-[#FF3B30]/5 rounded-xl px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={loading || !agreed}
            className="w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm disabled:opacity-40 transition-all active:scale-[0.97]">
            {loading ? 'Creating account...' : 'Get started'}
          </button>
        </form>

        <p className="text-[#8e8e93] text-sm text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#007AFF] font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
