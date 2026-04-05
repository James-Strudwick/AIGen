import { createClient, SupabaseClient } from '@supabase/supabase-js';

function getUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
}

function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
}

let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(getUrl(), getAnonKey());
  }
  return _supabase;
}

// Re-export as `supabase` for convenience - call sites use `supabase` as a SupabaseClient
export const supabase = {
  from: (...args: Parameters<SupabaseClient['from']>) => getSupabaseClient().from(...args),
};

export function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
  return createClient(getUrl(), serviceKey);
}
