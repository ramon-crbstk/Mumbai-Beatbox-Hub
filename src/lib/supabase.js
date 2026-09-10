import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://tcsovxxhoypfpkbmowhd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjc292eHhob3lwZnBrYm1vd2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3NTQzMjcsImV4cCI6MjEwNDMzMDMyN30.ff3GkoOL1Zz2rjmrIp_azLevX-vabB7Tlvicb3JVJUo';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  DEFAULT_SUPABASE_URL;

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  DEFAULT_SUPABASE_ANON_KEY;

/**
 * Reusable Supabase client for Mumbai Beatbox Hub
 * Connected to project: https://tcsovxxhoypfpkbmowhd.supabase.co
 * Uses environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 */
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseAnonKey.trim().length > 0 &&
  !supabaseUrl.includes('your-project')
);

export default supabase;
