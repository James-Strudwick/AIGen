'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/auth';

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finish = async () => {
      try {
        const supabase = createBrowserClient();

        // @supabase/supabase-js auto-detects the implicit-flow tokens in the
        // URL hash fragment and persists them on mount. Give it a beat and
        // then check for a session.
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (data.session) {
          window.location.href = '/dashboard';
          return;
        }

        // Fallback: listen for the SIGNED_IN event in case token exchange
        // hasn't completed yet.
        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            sub.subscription.unsubscribe();
            window.location.href = '/dashboard';
          }
        });

        // If we're still stuck after a few seconds, assume the link was
        // invalid or expired.
        setTimeout(() => {
          sub.subscription.unsubscribe();
          setError('Confirmation link is invalid or expired. Try logging in or signing up again.');
        }, 5000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong confirming your email.');
      }
    };
    finish();
  }, []);

  return (
    <div className="min-h-[100dvh] bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        {error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-[#FF3B30]/10 flex items-center justify-center mx-auto mb-5 text-2xl">
              ⚠️
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-2">Couldn&apos;t confirm email</h1>
            <p className="text-[#8e8e93] text-sm leading-relaxed mb-6">{error}</p>
            <a href="/login" className="block w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm">
              Back to log in
            </a>
          </>
        ) : (
          <>
            <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-[#e5e5ea] border-t-[#1a1a1a] animate-spin" />
            <p className="text-[#8e8e93] text-sm">Confirming your email...</p>
          </>
        )}
      </div>
    </div>
  );
}
