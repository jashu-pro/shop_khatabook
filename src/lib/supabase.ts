import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://rlubzemockqflxwutszx.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) && 
    Boolean(supabaseAnonKey) &&
    supabaseUrl.startsWith('http') &&
    supabaseUrl !== 'https://mock.supabase.co'
  );
};

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
