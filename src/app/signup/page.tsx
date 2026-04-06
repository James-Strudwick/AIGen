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

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Signup failed');

      // Create trainer record via API (uses service role)
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

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-4 py-3 text-[#1a1a1a] text-base placeholder-[#8e8e93] focus:outline-none focus:border-[#8e8e93]";

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

          {error && (
            <p className="text-[#FF3B30] text-sm bg-[#FF3B30]/5 rounded-xl px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={loading}
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
