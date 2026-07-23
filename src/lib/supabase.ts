import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_ENV_VALID } from '@/constants/env';

// Initialize the Supabase client only if environment variables are valid.
// If invalid, we export null which is safe because the application intercepts
// initialization and renders a Setup Screen before any service calls are made.
export const supabase = IS_ENV_VALID
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null as any;
