import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LoadingScreen } from '@/components/common/LoadingScreen';

export const ProtectedRoute: React.FC = () => {
  const { user, loading, initialized } = useAuthStore();

  if (!initialized || loading) {
    return <LoadingScreen message="Checking authentication status..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
