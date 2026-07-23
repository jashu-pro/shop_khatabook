import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute } from './ProtectedRoute';
import { ShopCheckRoute } from './ShopCheckRoute';
import { Login } from '@/features/auth/pages/Login';
import { Signup } from '@/features/auth/pages/Signup';
import { ForgotPassword } from '@/features/auth/pages/ForgotPassword';
import { Splash } from '@/features/auth/pages/Splash';
import { Dashboard } from '@/features/dashboard/pages/Dashboard';
import { RegisterShop } from '@/features/shop/pages/RegisterShop';
import { ShopProfile } from '@/features/shop/pages/ShopProfile';
import { CustomerList } from '@/features/customers/pages/CustomerList';
import { CustomerDetail } from '@/features/customers/pages/CustomerDetail';
import { SalesList } from '@/features/sales/pages/SalesList';
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
        {/* Guard for registered shops */}
        <Route element={<ShopCheckRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/shop-profile" element={<ShopProfile />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/:customerId" element={<CustomerDetail />} />
          <Route path="/sales" element={<SalesList />} />
        </Route>
        
        {/* Guard for registering a shop (shop must NOT exist yet) */}
        <Route element={<ShopCheckRoute />}>
          <Route path="/register-shop" element={<RegisterShop />} />
        </Route>
      </Route>

      {/* Catch All Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
