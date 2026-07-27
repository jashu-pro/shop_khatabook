import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { AuthModal } from '../../features/auth/AuthModal';
import { PinLockScreen } from '../../features/auth/PinLockScreen';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isPinEnabled, isLocked } = useAppStore();

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  if (isPinEnabled && isLocked) {
    return <PinLockScreen />;
  }

  return <>{children}</>;
};
