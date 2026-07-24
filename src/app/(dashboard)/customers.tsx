import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity, Alert } from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  Searchbar,
  FAB,
  Portal,
  Modal,
  Button,
  TextInput,
  HelperText,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useShopQuery } from '../../hooks/useShop';
import { useCustomersQuery, useCreateCustomerMutation } from '../../hooks/useCustomers';
import { useCustomerBalanceQuery } from '../../hooks/useSales';
import { ImageUploader } from '../../components/ImageUploader';
import { customerSchema, customerService } from 'shared';
import { Phone, MapPin, User, Wallet, Plus, Loader2 } from 'lucide-react-native';
import { router } from 'expo-router';
import type { Customer } from '../../types/customer.types';

function CustomerItem({ item, theme }: { item: Customer; theme: any }) {
  const { data: balanceData, isLoading } = useCustomerBalanceQuery(item.id);
  const balance = balanceData?.outstanding_credit ?? 0;

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <Surface style={styles.custCard} elevation={1}>
      <TouchableOpacity
        style={styles.custCardContent}
        onPress={() => router.push(`/customers/${item.id}` as any)}
      >
        {item.photo_url ? (
          <Avatar.Image size={46} source={{ uri: item.photo_url }} />
        ) : (
          <Avatar.Icon
            size={46}
            icon="account"
            style={{ backgroundColor: theme.colors.primaryContainer }}
          />
        )}
        <View style={styles.custCardMeta}>
          <Text style={styles.nameText}>{item.name}</Text>
          <View style={styles.metaLabelRow}>
            {item.phone && (
              <View style={styles.metaBadge}>
                <Phone size={10} color="#64748b" />
                <Text style={styles.metaBadgeText}>{item.phone}</Text>
              </View>
            )}
            {item.village && (
              <View style={styles.metaBadge}>
                <MapPin size={10} color="#64748b" />
                <Text style={styles.metaBadgeText}>{item.village}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.creditValueBox}>
          <Text style={styles.creditValueTitle}>Balance</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 4 }} />
          ) : (
            <Text
              style={[
                styles.creditValueText,
                { color: balance > 0 ? theme.colors.error : '#10b981' },
              ]}
            >
              ₹{formatAmount(balance)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Surface>
  );
}

export default function MobileCustomersList() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { data: shop } = useShopQuery(user?.id);
  const { data: customers = [], isLoading } = useCustomersQuery(shop?.id);
  const createCustomerMutation = useCreateCustomerMutation();

  const [searchQuery, setSearchQuery] = useState('');

  // Modal & Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Input Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('10000');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  const handlePhoneBlur = async () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone || !shop?.id) {
      setDuplicateWarning(false);
      return;
    }
    setCheckingPhone(true);
    try {
      const exists = await customerService.checkPhoneExists(shop.id, trimmedPhone);
      setDuplicateWarning(exists);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingPhone(false);
    }
  };

  const handleSave = async () => {
    setErrors({});
    if (!shop?.id) return;

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      village: village.trim(),
      address: address.trim(),
      credit_limit: creditLimit.trim() === '' ? 0 : Number(creditLimit),
      notes: notes.trim(),
    };

    // Zod Validation
    const validation = customerSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      let finalPhotoUrl = photo;
      let finalPhotoPath = null;

      if (photo && photo.startsWith('data:image')) {
        const timestamp = Date.now();
        const uploadResult = await customerService.uploadPhoto(
          shop.id,
          `customer_${timestamp}.jpg`,
          photo
        );
        if (uploadResult) {
          finalPhotoUrl = uploadResult.url;
          finalPhotoPath = uploadResult.path;
        }
      }

      await createCustomerMutation.mutateAsync({
        shop_id: shop.id,
        name: payload.name,
        phone: payload.phone || null,
        photo_url: finalPhotoUrl,
        photo_path: finalPhotoPath,
        village: payload.village || null,
        address: payload.address || null,
        notes: payload.notes || null,
        credit_limit: payload.credit_limit,
      });

      // Clear Form
      setName('');
      setPhone('');
      setVillage('');
      setAddress('');
      setCreditLimit('10000');
      setNotes('');
      setPhoto(null);
      setDuplicateWarning(false);
      setModalOpen(false);
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save customer account' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cust.phone && cust.phone.includes(searchQuery)) ||
      (cust.village && cust.village.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Customer Accounts</Text>

        <Searchbar
          placeholder="Search by name, phone or village..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchbarInput}
        />

        {isLoading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : filteredCustomers.length === 0 ? (
          <Text style={styles.emptyText}>No customers found matching search.</Text>
        ) : (
          <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => <CustomerItem item={item} theme={theme} />}
          />
        )}

        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color="#ffffff"
          onPress={() => setModalOpen(true)}
        />
      </View>

      {/* Add Customer Modal */}
      <Portal>
        <Modal
          visible={modalOpen}
          onDismiss={() => setModalOpen(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>Add New Customer</Text>

            {errors.form && (
              <Surface style={styles.errorBanner} elevation={0}>
                <Text style={styles.errorText}>{errors.form}</Text>
              </Surface>
            )}

            <ImageUploader
              value={photo}
              onChange={(base64) => setPhoto(base64)}
              label="Customer Photo"
              shape="circle"
            />

            <TextInput
              label="Customer Name *"
              value={name}
              onChangeText={setName}
              mode="outlined"
              error={!!errors.name}
              style={styles.modalInput}
            />
            {errors.name && <HelperText type="error">{errors.name}</HelperText>}

            <TextInput
              label="Mobile Number"
              value={phone}
              onChangeText={setPhone}
              onBlur={handlePhoneBlur}
              mode="outlined"
              keyboardType="phone-pad"
              error={!!errors.phone}
              style={styles.modalInput}
            />
            {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}
            {duplicateWarning && (
              <HelperText type="info" style={{ color: '#d97706' }}>
                ⚠️ A customer with this phone number already exists.
              </HelperText>
            )}

            <TextInput
              label="Village / Town"
              value={village}
              onChangeText={setVillage}
              mode="outlined"
              style={styles.modalInput}
            />

            <TextInput
              label="Credit Limit (₹) *"
              value={creditLimit}
              onChangeText={setCreditLimit}
              mode="outlined"
              keyboardType="numeric"
              error={!!errors.credit_limit}
              style={styles.modalInput}
            />
            {errors.credit_limit && <HelperText type="error">{errors.credit_limit}</HelperText>}

            <TextInput
              label="Additional Notes"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.modalInput}
            />

            <View style={styles.modalBtnRow}>
              <Button
                mode="outlined"
                onPress={() => setModalOpen(false)}
                style={{ flex: 1, marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                loading={isSubmitting}
                disabled={isSubmitting || checkingPhone}
                style={{ flex: 1 }}
              >
                Save
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
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
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 16,
  },
  searchbar: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginBottom: 16,
    elevation: 1,
  },
  searchbarInput: {
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 80,
  },
  custCard: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  custCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  custCardMeta: {
    flex: 1,
    marginLeft: 12,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  metaLabelRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaBadgeText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },
  creditValueBox: {
    alignItems: 'flex-end',
  },
  creditValueTitle: {
    fontSize: 10,
    color: '#94a3b8',
  },
  creditValueText: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  loaderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#475569',
  },
  emptySub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  // Modal Styles
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 24,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 16,
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
});
