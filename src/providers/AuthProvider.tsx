import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import type { Profile } from '../features/auth/types';

interface AuthContextType {
  user: Profile | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  signUp: (input: any) => Promise<boolean>;
  signIn: (input: any) => Promise<boolean>;
  signInWithGoogle: (isFirstLogin?: boolean) => Promise<boolean>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authStore = useAuthStore();

  useEffect(() => {
    authStore.restoreSession();
  }, []);

  return (
    <AuthContext.Provider value={{
      user: authStore.user,
      sessionToken: authStore.sessionToken,
      isAuthenticated: authStore.isAuthenticated,
      loading: authStore.loading,
      error: authStore.error,
      signUp: authStore.signUp,
      signIn: authStore.signIn,
      signInWithGoogle: authStore.signInWithGoogle,
      signOut: authStore.signOut,
      forgotPassword: authStore.forgotPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
