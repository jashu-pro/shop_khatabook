import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface, Card, Divider } from 'react-native-paper';
import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, User, Mail, Smartphone, Store, ChevronRight } from 'lucide-react-native';
import { APP_NAME, APP_VERSION } from '../constants/env';

export default function OnboardingScreen() {
  const { user, signOut } = useAuthStore();

  const handleRegisterShop = () => {
    router.push('/register-shop' as any);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Card Header */}
        <Surface style={styles.successCard} elevation={2}>
          <View style={styles.checkBackground}>
            <ShieldCheck size={56} color="#34d399" />
          </View>
          <Text style={styles.successTitle}>🎉 Authentication Successful</Text>
          <Text style={styles.successSubtitle}>Welcome to KhattaBook!</Text>
          <Text style={styles.phaseLabel}>Phase 1 Implementation Completed</Text>
        </Surface>

        {/* Identity Details Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Identity & Session Details</Text>
            <Divider style={styles.divider} />

            {/* Full Name */}
            <View style={styles.detailRow}>
              <User size={20} color="#6366f1" style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Full Name</Text>
                <Text style={styles.detailValue}>
                  {user?.user_metadata?.full_name || 'Not Provided'}
                </Text>
              </View>
            </View>

            {/* Email */}
            <View style={styles.detailRow}>
              <Mail size={20} color="#6366f1" style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Email Address</Text>
                <Text style={styles.detailValue}>{user?.email || 'N/A'}</Text>
              </View>
            </View>

            {/* Phone */}
            <View style={styles.detailRow}>
              <Smartphone size={20} color="#6366f1" style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Mobile Number</Text>
                <Text style={styles.detailValue}>
                  {user?.user_metadata?.phone_number || 'Not Linked'}
                </Text>
              </View>
            </View>

            {/* Session ID */}
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, styles.dotPlaceholder]} />
              <View>
                <Text style={styles.detailLabel}>Active User ID</Text>
                <Text style={styles.monoValue}>{user?.id || 'N/A'}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Action Button */}
        <Button
          mode="contained"
          onPress={handleRegisterShop}
          icon={() => <Store size={18} color="#ffffff" />}
          style={styles.actionBtn}
          contentStyle={styles.actionBtnContent}
          buttonColor="#6366f1"
        >
          Register Your Shop
        </Button>

        {/* Sign Out Fallback */}
        <Button mode="text" onPress={handleSignOut} style={styles.signOutBtn} textColor="#f43f5e">
          Sign Out of Account
        </Button>

        {/* Version Information */}
        <View style={styles.footer}>
          <Text style={styles.appName}>{APP_NAME}</Text>
          <Text style={styles.appVersion}>Version {APP_VERSION}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    padding: 24,
    justifyContent: 'center',
    flexGrow: 1,
  },
  successCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  checkBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    marginBottom: 12,
  },
  phaseLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 99,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#cbd5e1',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    marginRight: 16,
  },
  dotPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 2,
  },
  monoValue: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#334155',
    marginTop: 2,
  },
  actionBtn: {
    borderRadius: 8,
    marginBottom: 12,
  },
  actionBtnContent: {
    paddingVertical: 8,
  },
  signOutBtn: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  appName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  appVersion: {
    fontSize: 11,
    color: '#cbd5e1',
    marginTop: 2,
  },
});
