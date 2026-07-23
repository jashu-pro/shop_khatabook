import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from './ProtectedRoute';
import { Login } from '@/features/auth/pages/Login';
import { Signup } from '@/features/auth/pages/Signup';
import { ForgotPassword } from '@/features/auth/pages/ForgotPassword';
import { Splash } from '@/features/auth/pages/Splash';
import { DashboardPlaceholder } from '@/features/auth/pages/DashboardPlaceholder';
import { LoadingScreen } from '@/components/common/LoadingScreen';

export const AppRoutes: React.FC = () => {
  const { initializeAuth, initialized, loading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => {
      unsubscribe();
    };
  }, [initializeAuth]);

  if (!initialized && loading) {
    return <LoadingScreen message="Initializing KhattaBook..." />;
  }

  return (
    <Routes>
      {/* Splash Screen (determines auth state first) */}
      <Route path="/splash" element={<Splash />} />

      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Pages */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPlaceholder />} />
        <Route path="/dashboard" element={<DashboardPlaceholder />} />
      </Route>

      {/* Catch All Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
