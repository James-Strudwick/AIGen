'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/auth';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if we're in the "set new password" phase (user clicked the email link)
  const [isResetMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash.includes('type=recovery');
    }
    return false;
  });

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUpdating(true);

    try {
      const supabase = createBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const inputClass = "w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-4 py-3 text-[#1a1a1a] text-base placeholder-[#8e8e93] focus:outline-none focus:border-[#8e8e93]";

  return (
    <div className="min-h-[100dvh] bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Set new password (after clicking email link) */}
        {isResetMode ? (
          done ? (
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight mb-2">Password updated</h1>
              <p className="text-[#8e8e93] text-sm mb-6">You can now log in with your new password.</p>
              <Link href="/login" className="inline-block w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm text-center">
                Log in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center tracking-tight mb-1">Set new password</h1>
              <p className="text-[#8e8e93] text-sm text-center mb-8">Enter your new password below.</p>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="text-[#8e8e93] text-xs block mb-1">New password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters" required minLength={6} autoComplete="new-password" className={inputClass} />
                </div>
                {error && <p className="text-[#FF3B30] text-sm bg-[#FF3B30]/5 rounded-xl px-4 py-3">{error}</p>}
                <button type="submit" disabled={updating}
                  className="w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm disabled:opacity-40">
                  {updating ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </>
          )
        ) : (
          /* Request reset email */
          sent ? (
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight mb-2">Check your email</h1>
              <p className="text-[#8e8e93] text-sm mb-6">
                We&apos;ve sent a reset link to <strong className="text-[#1a1a1a]">{email}</strong>. Click the link in the email to set a new password.
              </p>
              <Link href="/login" className="text-[#007AFF] text-sm font-medium">Back to login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center tracking-tight mb-1">Reset password</h1>
              <p className="text-[#8e8e93] text-sm text-center mb-8">Enter your email and we&apos;ll send you a reset link.</p>
              <form onSubmit={handleSendReset} className="space-y-4">
                <div>
                  <label className="text-[#8e8e93] text-xs block mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required autoComplete="email" className={inputClass} />
                </div>
                {error && <p className="text-[#FF3B30] text-sm bg-[#FF3B30]/5 rounded-xl px-4 py-3">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm disabled:opacity-40">
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
              <p className="text-[#8e8e93] text-sm text-center mt-6">
                <Link href="/login" className="text-[#007AFF] font-medium">Back to login</Link>
              </p>
            </>
          )
        )}
      </div>
    </div>
  );
}
