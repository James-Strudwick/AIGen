'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/auth';

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finish = async () => {
      try {
        const supabase = createBrowserClient();

        // --- Path 1: PKCE flow ---
        // Supabase defaults new projects to PKCE. Email confirmation links
        // carry a `token_hash` + `type` query param that we exchange for a
        // session via verifyOtp.
        const params = new URLSearchParams(window.location.search);
        const tokenHash = params.get('token_hash');
        const type = params.get('type');
        const errDesc = params.get('error_description') || params.get('error');

        if (errDesc) {
          throw new Error(decodeURIComponent(errDesc));
        }

        if (tokenHash && type) {
          // Map the Supabase `type` to the verifyOtp type union
          const otpType = (type === 'signup' || type === 'email' || type === 'invite'
            || type === 'magiclink' || type === 'recovery' || type === 'email_change')
            ? type
            : 'signup';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType as any,
          });
          if (verifyError) throw verifyError;
          if (data.session) {
            window.location.href = '/dashboard';
            return;
          }
        }

        // --- Path 2: Implicit flow (legacy) ---
        // Older Supabase projects send tokens in the URL hash fragment. The
        // JS SDK auto-detects these on mount and persists the session, so we
        // just poll for it briefly.
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (data.session) {
          window.location.href = '/dashboard';
          return;
        }

        // Fallback: listen for SIGNED_IN in case the implicit-flow token
        // exchange is still finishing.
        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            sub.subscription.unsubscribe();
            window.location.href = '/dashboard';
          }
        });

        setTimeout(() => {
          sub.subscription.unsubscribe();
          setError('Confirmation link is invalid or expired. Try logging in or signing up again.');
        }, 6000);
      } catch (err) {
        console.error('[auth/callback]', err);
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
