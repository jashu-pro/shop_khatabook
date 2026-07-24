import { create } from 'zustand';
import { authService } from 'shared';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;

  // Actions
  initializeAuth: () => () => void; // Returns unsubscribe function
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phoneNumber?: string,
    avatarUrl?: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  error: null,

  clearError: () => set({ error: null }),

  initializeAuth: () => {
    set({ loading: true });

    // Fetch initial session
    authService
      .getCurrentSession()
      .then((session) => {
        set({
          session,
          user: session?.user ?? null,
          initialized: true,
          loading: false,
        });
      })
      .catch((err) => {
        set({
          error: err.message || 'Failed to retrieve active session',
          initialized: true,
          loading: false,
        });
      });

    // Listen for auth state transitions
    const authListener = authService.onSessionChange((session, user) => {
      set({
        session,
        user,
        initialized: true,
        loading: false,
      });
    });

    return () => {
      if (authListener && authListener.data && authListener.data.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await authService.signIn(email, password);
      if (error) throw error;
      set({
        session: data.session,
        user: data.user,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to sign in',
        loading: false,
      });
      throw err;
    }
  },

  signUp: async (email, password, fullName, phoneNumber, avatarUrl) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await authService.signUp(
        email,
        password,
        fullName,
        phoneNumber,
        avatarUrl
      );
      if (error) throw error;
      set({
        session: data.session,
        user: data.user,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to sign up',
        loading: false,
      });
      throw err;
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const data = await authService.signInWithGoogle();
      if (!data) throw new Error('Google Sign In failed');
      // Expo OAuth triggers are managed via redirects or native configs.
      set({ loading: false });
    } catch (err: any) {
      set({
        error: err.message || 'Failed Google Sign In',
        loading: false,
      });
      throw err;
    }
  },

  resetPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      const { error } = await authService.resetPassword(email);
      if (error) throw error;
      set({ loading: false });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to send reset link',
        loading: false,
      });
      throw err;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await authService.signOut();
      if (error) throw error;
      set({
        session: null,
        user: null,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to sign out',
        loading: false,
      });
      throw err;
    }
  },
}));
