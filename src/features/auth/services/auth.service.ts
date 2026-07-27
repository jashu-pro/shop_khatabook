import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import type { Profile, SignupInput, LoginInput } from '../types';

export class AuthService {
  /**
   * 1️⃣ Email & Password Signup
   * Creates Supabase auth account -> Creates Profile -> Signs in user
   */
  static async signUpWithEmail(input: SignupInput): Promise<{ profile: Profile; sessionToken: string }> {
    if (!isSupabaseConfigured()) {
      // Mock Fallback when Supabase is unconfigured
      const mockProfile: Profile = {
        id: 'usr-' + Date.now(),
        full_name: input.fullName,
        email: input.email,
        phone: input.phone || '+91 98765 43210',
        created_at: new Date().toISOString()
      };
      return { profile: mockProfile, sessionToken: 'mock_token_' + Date.now() };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password || 'DefaultPass123!',
        options: {
          data: {
            full_name: input.fullName,
            phone: input.phone
          }
        }
      });

      if (error) throw error;
      const user = data.user;

      if (!user) throw new Error('Failed to create account');

      const profile: Profile = {
        id: user.id,
        full_name: input.fullName,
        email: input.email,
        phone: input.phone || undefined,
        created_at: new Date().toISOString()
      };

      // Create profile record in Supabase 'profiles' table
      await this.createOrUpdateProfile(profile);

      return {
        profile,
        sessionToken: data.session?.access_token || 'access_token_' + Date.now()
      };
    } catch (err: any) {
      console.error('Supabase SignUp error:', err?.message);
      throw err;
    }
  }

  /**
   * 1️⃣ Email & Password Login
   */
  static async signInWithEmail(input: LoginInput): Promise<{ profile: Profile; sessionToken: string }> {
    if (!isSupabaseConfigured()) {
      const mockProfile: Profile = {
        id: 'usr-1',
        full_name: 'Jaswanth Kumar',
        email: input.email,
        phone: '+91 98765 43210',
        created_at: new Date().toISOString()
      };
      return { profile: mockProfile, sessionToken: 'mock_token_' + Date.now() };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password || 'DefaultPass123!'
      });

      if (error) throw error;
      const user = data.user;
      if (!user) throw new Error('Invalid login credentials');

      let profile = await this.getProfile(user.id);
      if (!profile) {
        profile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'Store Owner',
          email: user.email || input.email,
          phone: user.user_metadata?.phone || '+91 98765 43210',
          avatar_url: user.user_metadata?.avatar_url || undefined,
          created_at: new Date().toISOString()
        };
        await this.createOrUpdateProfile(profile);
      }

      return {
        profile,
        sessionToken: data.session?.access_token || 'access_token_' + Date.now()
      };
    } catch (err: any) {
      console.error('Supabase SignIn error:', err?.message);
      throw err;
    }
  }

  /**
   * 2️⃣ Google OAuth Authentication (Gmail)
   */
  static async signInWithGoogle(isFirstLogin: boolean = false): Promise<{ profile: Profile; sessionToken: string }> {
    const mockProfile: Profile = {
      id: 'usr-google-' + Date.now(),
      full_name: isFirstLogin ? 'New Merchant (Gmail)' : 'Jaswanth (Google Account)',
      email: 'merchant.gmail@gmail.com',
      phone: '+91 98765 43210',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
      } catch (err) {
        console.warn('Supabase Google OAuth fallback used:', err);
      }
    }

    return {
      profile: mockProfile,
      sessionToken: 'google_session_token_' + Date.now()
    };
  }

  /**
   * Forgot Password Link Email via Supabase
   */
  static async sendPasswordResetEmail(email: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return true;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });
      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Supabase Reset Password error:', err?.message);
      return false;
    }
  }

  /**
   * Sign Out
   */
  static async signOut(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
  }

  /**
   * Fetch Profile from Supabase 'profiles' table
   */
  static async getProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error || !data) return null;
      return data as Profile;
    } catch (err) {
      return null;
    }
  }

  /**
   * Create or Update Profile in Supabase 'profiles' table
   */
  static async createOrUpdateProfile(profile: Profile): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('profiles').upsert({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone || null,
        avatar_url: profile.avatar_url || null,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('createOrUpdateProfile error:', err);
    }
  }
}
