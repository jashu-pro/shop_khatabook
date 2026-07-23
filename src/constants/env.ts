export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Shop KhattaBook';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

export const IS_ENV_VALID = 
  Boolean(SUPABASE_URL) && 
  Boolean(SUPABASE_ANON_KEY) && 
  SUPABASE_URL !== 'your_supabase_project_url' && 
  SUPABASE_ANON_KEY !== 'your_supabase_anon_key';
