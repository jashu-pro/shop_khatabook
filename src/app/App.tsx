import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { AppRoutes } from '@/routes/AppRoutes';
import { useThemeStore } from '@/store/themeStore';
import { IS_ENV_VALID } from '@/constants/env';
import { SetupGuide } from '@/features/auth/pages/SetupGuide';

// Initialise React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    // Start listener for dark/light system changes
    const cleanupThemeListener = initTheme();
    return () => {
      cleanupThemeListener();
    };
  }, [initTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        {IS_ENV_VALID ? (
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        ) : (
          <SetupGuide />
        )}
      </ErrorBoundary>
    </QueryClientProvider>
  );
};
