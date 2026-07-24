import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, ScrollView, Share, DevSettings, Platform } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { ShieldAlert, RefreshCw, Copy, LogIn } from 'lucide-react-native';
import { router } from 'expo-router';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      // Reload native bundle in development mode
      DevSettings.reload();
    }
  };

  private handleShareError = async () => {
    if (!this.state.error) return;
    try {
      await Share.share({
        title: 'KhattaBook App Error Log',
        message: `Error: ${this.state.error.message}\n\nStack Trace:\n${this.state.error.stack || 'No stack trace available'}`,
      });
    } catch (err) {
      console.error('Error sharing error details:', err);
    }
  };

  private handleGoToLogin = () => {
    this.setState({ hasError: false, error: null });
    try {
      router.replace('/login' as any);
    } catch (err) {
      // Hard reload if router fails
      this.handleReload();
    }
  };

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'An unexpected rendering error occurred.';
      const errorStack = this.state.error?.stack || '';

      return (
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Surface style={styles.card} elevation={3}>
              {/* Alert Header */}
              <View style={styles.header}>
                <View style={styles.iconBackground}>
                  <ShieldAlert size={48} color="#f43f5e" />
                </View>
                <Text style={styles.title}>System Interrupted</Text>
                <Text style={styles.subtitle}>
                  KhattaBook intercepted a critical render failure. Don&apos;t worry, your credit
                  logs are safe.
                </Text>
              </View>

              {/* Error Information Details */}
              <Surface style={styles.detailsBox} elevation={0}>
                <Text style={styles.errorTextLabel}>Error Details:</Text>
                <Text style={styles.errorTextMessage}>{errorMessage}</Text>
                {errorStack ? (
                  <ScrollView nestedScrollEnabled style={styles.stackScroll}>
                    <Text style={styles.errorStack}>{errorStack}</Text>
                  </ScrollView>
                ) : null}
              </Surface>

              {/* Action Buttons */}
              <View style={styles.btnRow}>
                <Button
                  mode="contained"
                  icon={() => <RefreshCw size={16} color="#ffffff" />}
                  onPress={this.handleReload}
                  style={[styles.btn, styles.primaryBtn]}
                  contentStyle={styles.btnContent}
                >
                  Reload App
                </Button>

                <Button
                  mode="outlined"
                  icon={() => <Copy size={16} color="#6366f1" />}
                  onPress={this.handleShareError}
                  style={styles.btn}
                  contentStyle={styles.btnContent}
                  textColor="#6366f1"
                >
                  Copy / Share Log
                </Button>
              </View>

              <Button
                mode="text"
                icon={() => <LogIn size={16} color="#475569" />}
                onPress={this.handleGoToLogin}
                style={styles.loginFallbackBtn}
                textColor="#475569"
              >
                Go to Login Screen
              </Button>
            </Surface>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    backgroundColor: '#131b2e',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 18,
  },
  detailsBox: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  errorTextLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fb7185',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  errorTextMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 8,
  },
  stackScroll: {
    maxHeight: 120,
    marginTop: 8,
    backgroundColor: '#090d16',
    borderRadius: 6,
    padding: 8,
  },
  errorStack: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  btn: {
    flex: 1,
    borderRadius: 8,
  },
  primaryBtn: {
    backgroundColor: '#6366f1',
  },
  btnContent: {
    paddingVertical: 4,
  },
  loginFallbackBtn: {
    marginTop: 8,
  },
});
