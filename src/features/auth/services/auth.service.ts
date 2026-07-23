import { supabase } from '@/lib/supabase';
import { IS_ENV_VALID } from '@/constants/env';
import type { 
  AuthResponse, 
  Session, 
  User, 
  Subscription 
} from '@supabase/supabase-js';

export const authService = {
  /**
   * Register a new user with email, password, and metadata
   */
  async signUp(email: string, password: string, fullName: string, phoneNumber?: string): Promise<AuthResponse> {
    if (!IS_ENV_VALID) throw new Error('Supabase is not configured.');
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber || '',
        },
      },
    });
  },

  /**
   * Log in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    if (!IS_ENV_VALID) throw new Error('Supabase is not configured.');
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  /**
   * Log in using Google OAuth provider
   */
  async signInWithGoogle(): Promise<{ provider: 'google'; url: string } | null> {
    if (!IS_ENV_VALID) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data as any;
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    if (!IS_ENV_VALID) throw new Error('Supabase is not configured.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    return { error };
  },

  /**
   * Sign out the active user session
   */
  async signOut(): Promise<{ error: Error | null }> {
    if (!IS_ENV_VALID) throw new Error('Supabase is not configured.');
    const { error } = supabase ? await supabase.auth.signOut() : { error: null };
    return { error };
  },

  /**
   * Fetch the current authenticated session
   */
  async getCurrentSession(): Promise<Session | null> {
    if (!IS_ENV_VALID) return null;
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Listen to active session changes (login, logout, refresh token)
   */
  onSessionChange(callback: (session: Session | null, user: User | null) => void): { data: { subscription: Subscription } } | null {
    if (!IS_ENV_VALID) return null;
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session, session?.user ?? null);
    });
  },
};
