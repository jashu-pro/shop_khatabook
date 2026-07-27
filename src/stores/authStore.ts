import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Profile, SignupInput, LoginInput } from '../features/auth/types';
import { AuthService } from '../features/auth/services/auth.service';

interface AuthState {
  user: Profile | null;
  sessionToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  signUp: (input: SignupInput) => Promise<boolean>;
  signIn: (input: LoginInput) => Promise<boolean>;
  signInWithGoogle: (isFirstLogin?: boolean) => Promise<boolean>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        id: 'usr-1',
        full_name: 'Jaswanth Kumar',
        email: 'owner@srilaxmitraders.com',
        phone: '+91 98765 43210',
        created_at: new Date().toISOString()
      },
      sessionToken: 'jwt_token_demo_123',
      loading: false,
      isAuthenticated: true,
      error: null,

      signUp: async (input: SignupInput) => {
        set({ loading: true, error: null });
        try {
          const { profile, sessionToken } = await AuthService.signUpWithEmail(input);
          set({
            user: profile,
            sessionToken,
            isAuthenticated: true,
            loading: false
          });
          return true;
        } catch (err: any) {
          set({ error: err?.message || 'Failed to sign up', loading: false });
          return false;
        }
      },

      signIn: async (input: LoginInput) => {
        set({ loading: true, error: null });
        try {
          const { profile, sessionToken } = await AuthService.signInWithEmail(input);
          set({
            user: profile,
            sessionToken,
            isAuthenticated: true,
            loading: false
          });
          return true;
        } catch (err: any) {
          set({ error: err?.message || 'Invalid email or password', loading: false });
          return false;
        }
      },

      signInWithGoogle: async (isFirstLogin: boolean = false) => {
        set({ loading: true, error: null });
        try {
          const { profile, sessionToken } = await AuthService.signInWithGoogle(isFirstLogin);
          set({
            user: profile,
            sessionToken,
            isAuthenticated: true,
            loading: false
          });
          return true;
        } catch (err: any) {
          set({ error: err?.message || 'Google Auth failed', loading: false });
          return false;
        }
      },

      signOut: async () => {
        set({ loading: true });
        await AuthService.signOut();
        set({
          user: null,
          sessionToken: null,
          isAuthenticated: false,
          loading: false
        });
      },

      forgotPassword: async (email: string) => {
        set({ loading: true, error: null });
        const success = await AuthService.sendPasswordResetEmail(email);
        set({ loading: false });
        return success;
      },

      restoreSession: async () => {
        const state = get();
        if (state.sessionToken && state.user) {
          set({ isAuthenticated: true });
        } else {
          set({ isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'khattabook-auth-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
