import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  'https://tcsovxxhoypfpkbmowhd.supabase.co';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

/**
 * Reusable Supabase client for Mumbai Beatbox Hub
 * Connected to project: https://tcsovxxhoypfpkbmowhd.supabase.co
 * Uses environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 */
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'placeholder-anon-key-missing'
);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseAnonKey.trim().length > 0 &&
  !supabaseUrl.includes('your-project')
);

export default supabase;
