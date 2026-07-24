import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import NetworkProvider from '../providers/NetworkProvider';
import ThemeProvider from '../providers/ThemeProvider';
import AuthProvider from '../providers/AuthProvider';
import ErrorBoundary from '../components/common/ErrorBoundary';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NetworkProvider>
          <ThemeProvider>
            <AuthProvider>
              <ErrorBoundary>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="login" />
                  <Stack.Screen name="signup" />
                  <Stack.Screen name="forgot-password" />
                  <Stack.Screen name="onboarding" />
                  <Stack.Screen name="register-shop" />
                  <Stack.Screen name="(dashboard)" />
                </Stack>
              </ErrorBoundary>
            </AuthProvider>
          </ThemeProvider>
        </NetworkProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
