import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { BookOpen } from 'lucide-react-native';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingScreen({
  message = 'Loading KhattaBook...',
  subMessage = 'Restoring secure session',
}: LoadingScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Brand Logo Animation Area */}
        <View style={[styles.logoContainer, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
          <BookOpen size={48} color="#6366f1" />
        </View>

        {/* Text Details */}
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>KhattaBook</Text>
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>{message}</Text>

        {/* Spinner */}
        <ActivityIndicator size="large" color="#6366f1" style={styles.spinner} />

        {/* Footer Subtext */}
        {subMessage ? (
          <Text style={[styles.subMessage, { color: theme.colors.onSurfaceVariant }]}>
            {subMessage}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
    maxWidth: 320,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  spinner: {
    marginVertical: 16,
  },
  subMessage: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
});
