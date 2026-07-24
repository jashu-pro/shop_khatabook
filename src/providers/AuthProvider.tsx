import React, { useEffect, createContext, useContext } from 'react';
import { View, StyleSheet, ScrollView, DevSettings, Platform, Share } from 'react-native';
import { Text, Button, Surface, ActivityIndicator } from 'react-native-paper';
import { router, useSegments } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useShopQuery } from '../hooks/useShop';
import { IS_ENV_VALID, SUPABASE_URL, SUPABASE_ANON_KEY } from '../constants/env';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingScreen from '../components/common/LoadingScreen';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // If environment configuration is invalid, render Setup Screen immediately
  if (!IS_ENV_VALID) {
    return <SetupScreen />;
  }

  return <AuthProviderContent>{children}</AuthProviderContent>;
}

function AuthProviderContent({ children }: { children: React.ReactNode }) {
  const { user, initialized, loading, initializeAuth } = useAuthStore();
  const { data: shop, isLoading: shopLoading } = useShopQuery(user?.id);
  const segments = useSegments();

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => {
      unsubscribe();
    };
  }, [initializeAuth]);

  // Handle redirects based on state and path segments
  useEffect(() => {
    if (!initialized || loading || shopLoading) return;

    // Cast segments to generic string list to bypass Expo Router's static segment types
    const segmentList = segments as string[];
    const firstSegment = segmentList[0];

    // Check if current route is in auth group (login, signup, forgot-password)
    const inAuthGroup =
      firstSegment === 'login' || firstSegment === 'signup' || firstSegment === 'forgot-password';

    if (!user) {
      // Redirect unauthorized users to login if not already there
      if (!inAuthGroup) {
        router.replace('/login' as any);
      }
    } else {
      // Authenticated users
      if (!shop) {
        // Direct owners with no shop to onboarding screen
        if (firstSegment !== 'onboarding' && firstSegment !== 'register-shop') {
          router.replace('/onboarding' as any);
        }
      } else {
        // Direct fully onboarded owners to the dashboard
        if (
          inAuthGroup ||
          firstSegment === 'onboarding' ||
          firstSegment === 'register-shop' ||
          segmentList.length === 0 ||
          firstSegment === ''
        ) {
          router.replace('/(dashboard)' as any);
        }
      }
    }
  }, [user, shop, initialized, loading, shopLoading, segments]);

  // Display full-screen splash loader during startup checks
  if (!initialized || loading || shopLoading) {
    return (
      <LoadingScreen
        message="Checking authentication..."
        subMessage="Syncing your credit records"
      />
    );
  }

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

function SetupScreen() {
  const handleRetry = () => {
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      DevSettings.reload();
    }
  };

  const handleShareExample = async () => {
    const codeExample = `EXPO_PUBLIC_SUPABASE_URL=${SUPABASE_URL || 'your_project_url'}\nEXPO_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY || 'your_anon_key'}`;
    try {
      await Share.share({
        title: 'KhattaBook Env Example',
        message: codeExample,
      });
    } catch (err) {
      console.error('Error sharing env:', err);
    }
  };

  const codeExample = `EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\nEXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  return (
    <SafeAreaView style={styles.setupContainer}>
      <ScrollView contentContainerStyle={styles.setupScroll} keyboardShouldPersistTaps="handled">
        <Surface style={styles.setupCard} elevation={3}>
          <Text style={styles.setupTitle}>⚠️ Database Configuration Needed</Text>
          <Text style={styles.setupDesc}>
            Supabase environment variables are missing or set to default placeholders. Please
            configure them in your <Text style={styles.highlight}>.env</Text> file.
          </Text>

          {/* Status Box */}
          <Surface style={styles.statusBox} elevation={0}>
            <Text style={styles.statusHeader}>Configuration Verification:</Text>

            <View style={styles.statusRow}>
              <Text style={styles.varName}>EXPO_PUBLIC_SUPABASE_URL</Text>
              <Text
                style={
                  SUPABASE_URL && !SUPABASE_URL.includes('your_supabase')
                    ? styles.statusOk
                    : styles.statusMissing
                }
              >
                {SUPABASE_URL && !SUPABASE_URL.includes('your_supabase')
                  ? 'RESOLVED ✅'
                  : 'MISSING ❌'}
              </Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.varName}>EXPO_PUBLIC_SUPABASE_ANON_KEY</Text>
              <Text
                style={
                  SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('your_supabase')
                    ? styles.statusOk
                    : styles.statusMissing
                }
              >
                {SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('your_supabase')
                  ? 'RESOLVED ✅'
                  : 'MISSING ❌'}
              </Text>
            </View>
          </Surface>

          {/* Setup Guide */}
          <Text style={styles.instructionsHeader}>How to set up:</Text>
          <Text style={styles.instructionStep}>
            1. Create a file named <Text style={styles.highlight}>.env</Text> in the root folder of
            your project.
          </Text>
          <Text style={styles.instructionStep}>
            2. Paste your project Credentials as shown below:
          </Text>

          <Surface style={styles.codeBlock} elevation={0}>
            <Text style={styles.codeText}>{codeExample}</Text>
          </Surface>

          {/* Actions */}
          <Button
            mode="contained"
            onPress={handleRetry}
            style={styles.retryBtn}
            contentStyle={styles.retryBtnContent}
            buttonColor="#6366f1"
          >
            Retry Validation / Reload
          </Button>

          <Button
            mode="outlined"
            onPress={handleShareExample}
            style={styles.shareBtn}
            textColor="#6366f1"
          >
            Copy / Share Variable Names
          </Button>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  setupContainer: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  setupScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  setupCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#131b2e',
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fb7185',
    marginBottom: 12,
    textAlign: 'center',
  },
  setupDesc: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  highlight: {
    fontWeight: '700',
    color: '#818cf8',
  },
  statusBox: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  statusHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  varName: {
    fontSize: 11,
    color: '#cbd5e1',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusOk: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34d399',
  },
  statusMissing: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fb7185',
  },
  instructionsHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  instructionStep: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 16,
    marginBottom: 6,
  },
  codeBlock: {
    backgroundColor: '#090d16',
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
  },
  codeText: {
    fontSize: 11,
    color: '#cbd5e1',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
  exampleHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: 12,
  },
  retryBtn: {
    marginTop: 16,
    borderRadius: 8,
  },
  retryBtnContent: {
    paddingVertical: 4,
  },
  shareBtn: {
    marginTop: 10,
    borderRadius: 8,
    borderColor: '#6366f1',
  },
});
