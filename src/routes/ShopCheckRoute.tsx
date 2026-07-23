import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useShopQuery } from '@/features/shop/hooks/useShop';
import { LoadingScreen } from '@/components/common/LoadingScreen';

export const ShopCheckRoute: React.FC = () => {
  const { user } = useAuthStore();
  const { data: shop, isLoading } = useShopQuery(user?.id);
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen message="Verifying shop configurations..." />;
  }

  const isRegistering = location.pathname === '/register-shop';

  if (!shop) {
    if (!isRegistering) {
      // Force onboarding registration
      return <Navigate to="/register-shop" replace />;
    }
  } else {
    if (isRegistering) {
      // Prevent access to registration page if shop already exists
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};
