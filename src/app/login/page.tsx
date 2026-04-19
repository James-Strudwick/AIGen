'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsConfirm(false);
    setResent(false);
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        // Supabase returns specific codes for unconfirmed emails so we can
        // show a helpful "resend confirmation" state instead of a generic
        // "invalid credentials" error.
        const msg = authError.message.toLowerCase();
        if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
          setNeedsConfirm(true);
          return;
        }
        throw authError;
      }

      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setResent(false);
    try {
      const supabase = createBrowserClient();
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (resendError) throw resendError;
      setResent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend — try signing up again.');
    } finally {
      setResending(false);
    }
  };

  const inputClass = "w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-4 py-3 text-[#1a1a1a] text-base placeholder-[#8e8e93] focus:outline-none focus:border-[#8e8e93]";

  if (needsConfirm) {
    return (
      <div className="min-h-[100dvh] bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-5 text-2xl">📧</div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Confirm your email first</h1>
          <p className="text-[#8e8e93] text-sm leading-relaxed mb-6">
            We sent a confirmation link to<br />
            <span className="text-[#1a1a1a] font-medium">{email}</span>
          </p>
          <p className="text-[#8e8e93] text-xs leading-relaxed mb-6">
            Click it to finish setting up. Check your spam folder if you don&apos;t see it.
          </p>
          {resent ? (
            <p className="text-[#34C759] text-sm font-medium mb-6">✓ New link sent — check your inbox.</p>
          ) : (
            <button onClick={handleResend} disabled={resending}
              className="w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm disabled:opacity-40 transition-all active:scale-[0.97] mb-3">
              {resending ? 'Sending...' : 'Resend confirmation email'}
            </button>
          )}
          <button onClick={() => { setNeedsConfirm(false); setResent(false); }}
            className="text-[#8e8e93] text-xs font-medium hover:underline">
            Back to log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center tracking-tight mb-1">Welcome back</h1>
        <p className="text-[#8e8e93] text-sm text-center mb-8">Log in to your dashboard</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[#8e8e93] text-xs block mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required autoComplete="email" className={inputClass} />
          </div>
          <div>
            <label className="text-[#8e8e93] text-xs block mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password" required autoComplete="current-password" className={inputClass} />
          </div>

          {error && (
            <p className="text-[#FF3B30] text-sm bg-[#FF3B30]/5 rounded-xl px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm disabled:opacity-40 transition-all active:scale-[0.97]">
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <p className="text-[#8e8e93] text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#007AFF] font-medium">Sign up</Link>
          </p>
          <Link href="/reset-password" className="text-[#8e8e93] text-xs hover:text-[#1a1a1a] transition-colors">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}
