import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_ENV_VALID } from '../constants/env';

export const supabase = IS_ENV_VALID
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: typeof window !== 'undefined' && window.location ? true : false,
      },
    })
  : null as any;
