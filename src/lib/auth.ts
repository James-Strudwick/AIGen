import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

/** Browser-side Supabase client for auth (uses anon key, relies on RLS) */
export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
