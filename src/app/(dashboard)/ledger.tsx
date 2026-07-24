import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen } from 'lucide-react-native';

export default function MobileLedgerScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Surface style={styles.card} elevation={1}>
          <BookOpen size={48} color={theme.colors.primary} style={{ marginBottom: 16 }} />
          <Text style={styles.heading}>Digital Ledger Book</Text>
          <Text style={styles.subtitle}>
            All credit sales and payments logs will appear here. This section will be integrated in subsequent phases.
          </Text>
        </Surface>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    padding: 32,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: 320,
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});
