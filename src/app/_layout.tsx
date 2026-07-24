import React, { useEffect } from 'react';
import { useColorScheme, ActivityIndicator, View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useShopQuery } from '../hooks/useShop';
import { useThemeStore } from '../store/themeStore';

const queryClient = new QueryClient();

// Custom Material 3 Light/Dark Colors
const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366f1',
    secondary: '#4f46e5',
    background: '#f8fafc',
    surface: '#ffffff',
    error: '#ef4444',
  },
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818cf8',
    secondary: '#6366f1',
    background: '#0f172a',
    surface: '#1e293b',
    error: '#f87171',
  },
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutContent />
    </QueryClientProvider>
  );
}

function RootLayoutContent() {
  const systemColorScheme = useColorScheme();
  const { theme } = useThemeStore();
  const { user, initialized, loading, initializeAuth } = useAuthStore();
  const { data: shop, isLoading: shopLoading } = useShopQuery(user?.id);

  // Initialize auth session listeners
  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => {
      unsubscribe();
    };
  }, [initializeAuth]);

  // Determine active color scheme
  const resolvedColorScheme = theme === 'system' ? systemColorScheme : theme;
  const activePaperTheme = resolvedColorScheme === 'dark' ? customDarkTheme : customLightTheme;

  // Navigation controller mapping based on Auth & Onboarding state
  useEffect(() => {
    if (!initialized || loading || shopLoading) return;

    if (!user) {
      // Direct unauthorized users to login
      router.replace('/login' as any);
    } else if (!shop) {
      // Direct authorized owners with no shop to registration wizard
      router.replace('/register-shop' as any);
    } else {
      // Direct fully onboarded owners to the dashboard
      router.replace('/(dashboard)' as any);
    }
  }, [user, shop, initialized, loading, shopLoading]);

  // Render loading splash spinner during initialization checks
  if (!initialized || loading || shopLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: activePaperTheme.colors.background }}>
        <ActivityIndicator size="large" color={activePaperTheme.colors.primary} />
      </View>
    );
  }

  return (
    <PaperProvider theme={activePaperTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="register-shop" />
        <Stack.Screen name="(dashboard)" />
        <Stack.Screen name="customers/[customerId]" />
      </Stack>
    </PaperProvider>
  );
}
