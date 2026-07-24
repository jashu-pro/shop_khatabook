import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText } from 'react-native-paper';
import { router, Link } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { resetPassword, loading, error, clearError } = useAuthStore();

  const handleReset = async () => {
    setValidationError('');
    clearError();
    setSuccess(false);

    if (!email.trim()) {
      setValidationError('Email address is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setValidationError('Please enter a valid email address');
      return;
    }

    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (err: any) {
      // Errors managed in the authStore
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top navigation back button */}
          <Link href={'/login' as any} asChild>
            <Button
              mode="text"
              icon={() => <ArrowLeft size={16} color="#6366f1" />}
              style={styles.backBtn}
              textColor="#6366f1"
            >
              Back to Login
            </Button>
          </Link>

          <View style={styles.header}>
            <Text style={styles.logoText}>KhattaBook</Text>
            <Text style={styles.subtitle}>
              Recover and reset your owner ledger account password
            </Text>
          </View>

          <Surface style={styles.formCard} elevation={2}>
            <Text style={styles.formTitle}>Forgot Password</Text>

            {/* Error alerts banner */}
            {(error || validationError) && (
              <Surface style={styles.errorBanner} elevation={0}>
                <ShieldAlert size={16} color="#ef4444" style={styles.bannerIcon} />
                <Text style={styles.errorText}>{error || validationError}</Text>
              </Surface>
            )}

            {/* Success message banner */}
            {success && (
              <Surface style={styles.successBanner} elevation={0}>
                <CheckCircle2 size={16} color="#10b981" style={styles.bannerIcon} />
                <Text style={styles.successText}>
                  Recovery link sent! Please check your email inbox to complete password reset.
                </Text>
              </Surface>
            )}

            <Text style={styles.instructions}>
              Enter the email address registered with your shop. We will send a secure link to reset
              your password.
            </Text>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <TextInput
                label="Email Address"
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setValidationError('');
                  clearError();
                }}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                disabled={loading || success}
                error={!!validationError}
                left={<TextInput.Icon icon={() => <Mail size={16} color="#64748b" />} />}
              />
              {validationError && (
                <HelperText type="error" visible>
                  {validationError}
                </HelperText>
              )}
            </View>

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleReset}
              loading={loading}
              disabled={loading || success}
              style={styles.submitBtn}
              contentStyle={styles.submitBtnContent}
              buttonColor="#6366f1"
            >
              Send Reset Link
            </Button>
          </Surface>
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
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    marginLeft: -8,
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
    maxWidth: 280,
    lineHeight: 20,
  },
  formCard: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
  },
  instructions: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  submitBtn: {
    borderRadius: 8,
  },
  submitBtnContent: {
    paddingVertical: 6,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#d1fae5',
    marginBottom: 16,
  },
  successText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  bannerIcon: {
    marginRight: 10,
  },
});
