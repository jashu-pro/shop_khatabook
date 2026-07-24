import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import { router, Link } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn, loading, error, clearError } = useAuthStore();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleLogin = async () => {
    setValidationErrors({});
    clearError();

    // Basic local check
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = 'Email address is required';
    if (!password) errors.password = 'Password is required';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await signIn(email.trim(), password);
      // layout side-effect handles routing redirect automatically
    } catch (err: any) {
      // errors managed in store
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logoText}>KhattaBook</Text>
            <Text style={styles.subtitle}>Digital credit ledger notebook for shop owners</Text>
          </View>

          <Surface style={styles.formCard} elevation={2}>
            <Text style={styles.formTitle}>Login to your Account</Text>

            {/* Error alerts banner */}
            {(error || validationErrors.form) && (
              <Surface style={styles.errorBanner} elevation={0}>
                <Text style={styles.errorText}>{error || validationErrors.form}</Text>
              </Surface>
            )}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <TextInput
                label="Email Address"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setValidationErrors(prev => ({ ...prev, email: '' }));
                }}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                disabled={loading}
                error={!!validationErrors.email}
              />
              {validationErrors.email && (
                <HelperText type="error" visible>
                  {validationErrors.email}
                </HelperText>
              )}
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <TextInput
                label="Password"
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  setValidationErrors(prev => ({ ...prev, password: '' }));
                }}
                mode="outlined"
                secureTextEntry={!showPassword}
                disabled={loading}
                error={!!validationErrors.password}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
              {validationErrors.password && (
                <HelperText type="error" visible>
                  {validationErrors.password}
                </HelperText>
              )}
            </View>

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.submitBtn}
              contentStyle={styles.submitBtnContent}
            >
              Sign In
            </Button>
          </Surface>

          {/* Direct Sign-up Router */}
          <View style={styles.footerLinkRow}>
            <Text style={styles.footerLabel}>New to KhattaBook?</Text>
            <Link href={"/signup" as any} asChild>
              <Button compact mode="text" labelStyle={styles.signUpTextLink}>
                Register Shop
              </Button>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#6366f1',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 260,
    lineHeight: 20,
  },
  formCard: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  submitBtn: {
    marginTop: 8,
    borderRadius: 8,
  },
  submitBtnContent: {
    paddingVertical: 6,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fee2e2',
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  footerLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerLabel: {
    color: '#64748b',
    fontSize: 14,
  },
  signUpTextLink: {
    fontWeight: '700',
    color: '#6366f1',
    fontSize: 14,
  },
});
