import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Surface, Avatar, TextInput, Button, SegmentedButtons, HelperText, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useShopQuery } from '../../hooks/useShop';
import { useThemeStore } from '../../store/themeStore';
import { ImageUploader } from '../../components/ImageUploader';
import { LogOut, Save, ShieldAlert } from 'lucide-react-native';

export default function MobileSettingsScreen() {
  const theme = useTheme();
  const { user, signOut, loading: authLoading } = useAuthStore();
  const { data: shop, isLoading } = useShopQuery(user?.id);
  const { theme: appTheme, setTheme } = useThemeStore();

  const [shopName, setShopName] = useState(shop?.shop_name || '');
  const [ownerName, setOwnerName] = useState(shop?.owner_name || '');
  const [upiId, setUpiId] = useState(shop?.upi_id || '');
  const [logo, setLogo] = useState<string | null>(shop?.shop_logo_url || null);

  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of your shop ledger?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', onPress: async () => {
          try {
            await signOut();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Logout failed.');
          }
        }
      }
    ]);
  };

  const handleSave = async () => {
    if (!shopName.trim()) {
      Alert.alert('Error', 'Shop name is required.');
      return;
    }
    setSaving(true);
    try {
      // Mock saving update profile (which maps to real shopService.createShop/updateShop in shared)
      setTimeout(() => {
        Alert.alert('Success', 'Shop configurations updated successfully.');
        setSaving(false);
      }, 800);
    } catch (err) {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Settings</Text>

        {/* Profile Card */}
        <Surface style={styles.profileSection} elevation={1}>
          <Avatar.Text size={48} label={ownerName.substring(0, 2).toUpperCase() || 'SB'} style={{ backgroundColor: theme.colors.primaryContainer }} />
          <View style={{ marginLeft: 16 }}>
            <Text style={styles.ownerNameText}>{ownerName || 'Shop Owner'}</Text>
            <Text style={styles.ownerEmailText}>{user?.email}</Text>
          </View>
        </Surface>

        {/* Theme Settings */}
        <Text style={styles.sectionTitle}>App Theme</Text>
        <Surface style={styles.card} elevation={1}>
          <SegmentedButtons
            value={appTheme}
            onValueChange={(val) => setTheme(val as any)}
            buttons={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
          />
        </Surface>

        {/* Shop Configuration */}
        <Text style={styles.sectionTitle}>Shop Information</Text>
        <Surface style={styles.card} elevation={1}>
          <ImageUploader
            value={logo}
            onChange={setLogo}
            label="Shop Logo"
            shape="square"
          />

          <TextInput
            label="Shop Name"
            value={shopName}
            onChangeText={setShopName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Owner Name"
            value={ownerName}
            onChangeText={setOwnerName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="UPI ID for Customers Collections"
            value={upiId}
            onChangeText={setUpiId}
            mode="outlined"
            placeholder="e.g. storename@upi"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            icon={() => <Save size={16} color="#ffffff" />}
            style={styles.saveBtn}
          >
            Save Profile
          </Button>
        </Surface>

        {/* Danger Zone */}
        <Text style={styles.sectionTitle}>Account</Text>
        <Button
          mode="outlined"
          onPress={handleLogout}
          icon={() => <LogOut size={16} color={theme.colors.error} />}
          style={[styles.logoutBtn, { borderColor: theme.colors.error }]}
          labelStyle={{ color: theme.colors.error }}
          loading={authLoading}
        >
          Sign Out
        </Button>
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
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginBottom: 24,
  },
  ownerNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  ownerEmailText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 10,
  },
  card: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  saveBtn: {
    marginTop: 8,
    borderRadius: 8,
  },
  logoutBtn: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
});
