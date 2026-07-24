const getEnvVar = (name: string): string => {
  // Check process.env (Node/Expo)
  if (typeof process !== 'undefined' && process.env) {
    if (name === 'VITE_SUPABASE_URL') {
      return process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    }
    if (name === 'VITE_SUPABASE_ANON_KEY') {
      return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    }
    return process.env[name] || '';
  }
  // Check import.meta.env (Vite/Web)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[name] || '';
  }
  return '';
};

export const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');
export const APP_NAME = getEnvVar('VITE_APP_NAME') || 'Shop KhattaBook';
export const APP_VERSION = getEnvVar('VITE_APP_VERSION') || '1.0.0';

export const IS_ENV_VALID =
  Boolean(SUPABASE_URL) &&
  Boolean(SUPABASE_ANON_KEY) &&
  SUPABASE_URL !== 'your_supabase_project_url' &&
  SUPABASE_ANON_KEY !== 'your_supabase_anon_key';
