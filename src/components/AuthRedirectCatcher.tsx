'use client';

import { useEffect } from 'react';

/**
 * Defensive catcher for misconfigured Supabase redirect URLs.
 *
 * If Supabase's "Redirect URLs" allowlist doesn't include our
 * /auth/callback route, Supabase falls back to the Site URL (the home
 * page) and leaves the auth tokens in the URL hash fragment or query
 * string. We'd be silently dropping unconfirmed users on the landing
 * page with no hint that they need to do anything.
 *
 * This component detects those tokens and bounces the user straight to
 * /auth/callback so confirmation completes anyway. Silent fix — user
 * never sees the landing page they shouldn't have been on.
 */
export default function AuthRedirectCatcher() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const { hash, search } = window.location;

    // PKCE flow puts the token in the query string: ?token_hash=...&type=...
    const hasPkceToken = /[?&](token_hash|code)=/.test(search);
    // Implicit flow puts the session in the hash: #access_token=...&refresh_token=...
    const hasImplicitToken = /[#&](access_token|refresh_token)=/.test(hash);
    // Error params (e.g. expired link) should also be forwarded so the
    // callback can show a useful message rather than landing on /.
    const hasError = /[?&]error=|[#&]error=/.test(search + hash);

    if (hasPkceToken || hasImplicitToken || hasError) {
      // Preserve both query + hash so whichever flow Supabase used still works.
      window.location.replace(`/auth/callback${search}${hash}`);
    }
  }, []);

  return null;
}
