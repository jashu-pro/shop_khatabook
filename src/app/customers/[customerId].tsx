import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking, TouchableOpacity } from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  Button,
  TextInput,
  HelperText,
  useTheme,
  ActivityIndicator,
  Portal,
  Modal,
  Divider,
  IconButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { useShopQuery } from '../../hooks/useShop';
import {
  useCustomerDetailQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from '../../hooks/useCustomers';
import {
  useCustomerBalanceQuery,
  useCustomerLedgerQuery,
  useCreateSaleMutation,
} from '../../hooks/useSales';
import { ImageUploader } from '../../components/ImageUploader';
import { RecordSaleForm } from '../../components/RecordSaleForm';
import { customerSchema , customerService } from 'shared';
import {
  Phone,
  MapPin,
  Calendar,
  Wallet,
  Trash2,
  Edit2,
  ArrowLeft,
  Send,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react-native';

export default function MobileCustomerDetail() {
  const theme = useTheme();
  const router = useRouter();
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const { user } = useAuthStore();
  const { data: shop } = useShopQuery(user?.id);

  // Queries & Mutations
  const { data: customer, isLoading } = useCustomerDetailQuery(customerId);
  const updateCustomerMutation = useUpdateCustomerMutation();
  const deleteCustomerMutation = useDeleteCustomerMutation();
  const createSaleMutation = useCreateSaleMutation();

  // Outstanding Dynamic Ledger Queries
  const { data: balanceData } = useCustomerBalanceQuery(customerId);
  const { data: ledgerData = { sales: [], payments: [] } } = useCustomerLedgerQuery(customerId);

  const outstandingCredit = balanceData?.outstanding_credit || 0;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form edit fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('10000');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  const handleOpenEdit = () => {
    if (!customer) return;
    setName(customer.name);
    setPhone(customer.phone || '');
    setVillage(customer.village || '');
    setAddress(customer.address || '');
    setCreditLimit(customer.credit_limit.toString());
    setNotes(customer.notes || '');
    setPhoto(customer.photo_url);
    setErrors({});
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    setErrors({});
    if (!customerId || !shop?.id) return;

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      village: village.trim(),
      address: address.trim(),
      credit_limit: creditLimit.trim() === '' ? 0 : Number(creditLimit),
      notes: notes.trim(),
    };

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

    setSaving(true);
    try {
      let finalPhotoUrl = photo;
      let finalPhotoPath = customer?.photo_path || null;

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

      await updateCustomerMutation.mutateAsync({
        customerId,
        input: {
          name: payload.name,
          phone: payload.phone || null,
          photo_url: finalPhotoUrl,
          photo_path: finalPhotoPath,
          village: payload.village || null,
          address: payload.address || null,
          notes: payload.notes || null,
          credit_limit: payload.credit_limit,
        },
        shopId: shop.id,
      });

      setIsEditOpen(false);
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to update customer' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!customerId || !shop?.id) return;

    Alert.alert(
      'Delete Customer',
      `Are you sure you want to permanently delete ${customer?.name || 'this customer'}'s ledger notebook?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomerMutation.mutateAsync({
                customerId,
                shopId: shop.id,
              });
              router.replace('/(dashboard)/customers' as any);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete customer.');
            }
          },
        },
      ]
    );
  };

  const handleSaveSale = async (payload: any) => {
    if (!shop?.id || !customerId) return;
    await createSaleMutation.mutateAsync({
      shop_id: shop.id,
      customer_id: customerId,
      ...payload,
    });
    setIsRecordSaleOpen(false);
    Alert.alert('Success', 'Credit sale has been recorded.');
  };

  const handleSendReminder = async () => {
    if (!customer?.phone) {
      Alert.alert('No Number', 'This customer does not have a registered mobile number.');
      return;
    }

    const formattedPhone =
      customer.phone.startsWith('91') || customer.phone.length > 10
        ? customer.phone
        : `91${customer.phone}`;

    const shopName = shop?.shop_name || 'our store';
    const msg = `Dear ${customer.name}, this is a friendly reminder from ${shopName} that your outstanding credit balance in our ledger is ₹${formatAmount(outstandingCredit)}. Please clear it at your earliest convenience. Thank you!`;

    const url = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(msg)}`;
    const webUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (err) {
      await Linking.openURL(webUrl);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!customer) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Customer Not Found</Text>
          <Button
            mode="contained"
            onPress={() => router.replace('/(dashboard)/customers' as any)}
            style={{ marginTop: 16 }}
          >
            Back to Customers
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Combine sales and payments sorted by date desc
  const ledgerChronology = [
    ...ledgerData.sales.map((s) => ({ ...s, entryType: 'sale' as const })),
    ...ledgerData.payments.map((p) => ({ ...p, entryType: 'payment' as const })),
  ].sort((a, b) => {
    const dateA = new Date(a.entryType === 'sale' ? a.sale_date : a.payment_date).getTime();
    const dateB = new Date(b.entryType === 'sale' ? b.sale_date : b.payment_date).getTime();
    return dateB - dateA;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <IconButton
          icon={() => <ArrowLeft size={20} color={theme.colors.onSurface} />}
          onPress={() => router.back()}
        />
        <Text style={styles.headerTitle}>Customer Profile</Text>
        <IconButton icon="pencil" iconColor={theme.colors.primary} onPress={handleOpenEdit} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Surface style={styles.profileCard} elevation={1}>
          <View style={styles.profileHeader}>
            {customer.photo_url ? (
              <Avatar.Image size={64} source={{ uri: customer.photo_url }} />
            ) : (
              <Avatar.Icon
                size={64}
                icon="account"
                style={{ backgroundColor: theme.colors.primaryContainer }}
              />
            )}

            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={styles.name}>{customer.name}</Text>
              <View style={styles.dateRow}>
                <Calendar size={12} color="#94a3b8" />
                <Text style={styles.dateText}>
                  Added{' '}
                  {new Date(customer.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Balance card panel */}
          <Surface style={styles.balanceBox} elevation={0}>
            <Text style={styles.balanceLabel}>Outstanding Balance</Text>
            <Text
              style={[
                styles.balanceValue,
                { color: outstandingCredit > 0 ? theme.colors.error : '#64748b' },
              ]}
            >
              ₹{formatAmount(outstandingCredit)}
            </Text>

            {/* Quick Actions inside Balance Panel */}
            <Button
              mode="contained"
              onPress={() => setIsRecordSaleOpen(true)}
              icon={() => <Plus size={16} color="#ffffff" />}
              style={styles.recordBtn}
            >
              Record Credit Sale
            </Button>

            <Button
              mode="outlined"
              onPress={handleSendReminder}
              disabled={outstandingCredit === 0}
              icon={() => (
                <Send size={14} color={outstandingCredit > 0 ? theme.colors.primary : '#94a3b8'} />
              )}
              style={styles.reminderBtn}
            >
              Send WhatsApp Reminder
            </Button>
          </Surface>
        </Surface>

        {/* Contact Specs */}
        <Surface style={styles.detailsCard} elevation={1}>
          <Text style={styles.cardSectionHeading}>Ledger Boundaries & Contact</Text>

          <View style={styles.detailsRow}>
            <Phone size={16} color="#64748b" />
            <View style={styles.detailsTextCol}>
              <Text style={styles.detailsLabel}>Mobile Number</Text>
              <Text style={styles.detailsVal}>{customer.phone || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <MapPin size={16} color="#64748b" />
            <View style={styles.detailsTextCol}>
              <Text style={styles.detailsLabel}>Village / Town</Text>
              <Text style={styles.detailsVal}>{customer.village || 'N/A'}</Text>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <Wallet size={16} color="#64748b" />
            <View style={styles.detailsTextCol}>
              <Text style={styles.detailsLabel}>Allowed Credit Limit</Text>
              <Text style={styles.detailsVal}>₹{formatAmount(customer.credit_limit)}</Text>
            </View>
          </View>
        </Surface>

        {/* Customer description Notes */}
        <Surface style={styles.detailsCard} elevation={1}>
          <Text style={styles.cardSectionHeading}>Debtor Landmarks & Notes</Text>
          <Text style={styles.notesText}>
            {customer.notes || 'No description notes recorded for this customer.'}
          </Text>
        </Surface>

        {/* Chronological Ledger logs */}
        <Surface style={styles.detailsCard} elevation={1}>
          <Text style={styles.cardSectionHeading}>Chronological Ledger Log</Text>
          {ledgerChronology.length === 0 ? (
            <Text style={styles.emptyLedgerText}>No sales or payment logs recorded yet.</Text>
          ) : (
            ledgerChronology.map((entry) => {
              const isSale = entry.entryType === 'sale';
              const amount = isSale ? entry.total_amount : entry.payment_amount;
              const date = isSale ? entry.sale_date : entry.payment_date;
              const label = isSale
                ? `Credit Sale (${entry.sale_number})`
                : `Payment Received (${entry.payment_method?.toUpperCase()})`;
              const notesText = entry.notes || '';

              return (
                <View key={entry.id} style={styles.ledgerLogItem}>
                  <View style={styles.ledgerLogMeta}>
                    <View style={styles.ledgerLogHeader}>
                      {isSale ? (
                        <ArrowUpRight
                          size={14}
                          color={theme.colors.error}
                          style={{ marginRight: 4 }}
                        />
                      ) : (
                        <ArrowDownLeft size={14} color="#10b981" style={{ marginRight: 4 }} />
                      )}
                      <Text style={styles.ledgerLogLabel}>{label}</Text>
                    </View>
                    <Text style={styles.ledgerLogDate}>
                      {new Date(date).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {notesText ? <Text style={styles.ledgerLogNotes}>{notesText}</Text> : null}
                  </View>
                  <Text
                    style={[
                      styles.ledgerLogAmt,
                      { color: isSale ? theme.colors.error : '#10b981' },
                    ]}
                  >
                    {isSale ? '+' : '-'} ₹{formatAmount(amount)}
                  </Text>
                </View>
              );
            })
          )}
        </Surface>

        {/* Address */}
        <Surface style={styles.detailsCard} elevation={1}>
          <Text style={styles.cardSectionHeading}>Billing Address</Text>
          <Text style={styles.notesText}>
            {customer.address || 'No physical address details registered.'}
          </Text>
        </Surface>

        {/* Action Triggers */}
        <View style={styles.actionRow}>
          <Button
            mode="outlined"
            onPress={handleDelete}
            icon={() => <Trash2 size={14} color={theme.colors.error} />}
            style={{ flex: 1 }}
            labelStyle={{ color: theme.colors.error }}
          >
            Delete Customer Account
          </Button>
        </View>
      </ScrollView>

      {/* Edit Customer Modal */}
      <Portal>
        <Modal
          visible={isEditOpen}
          onDismiss={() => setIsEditOpen(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>Edit Customer Profile</Text>

            {errors.form && (
              <Surface style={styles.errorBanner} elevation={0}>
                <Text style={styles.formErrorText}>{errors.form}</Text>
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
              style={styles.modalInput}
              error={!!errors.name}
            />
            {errors.name && <HelperText type="error">{errors.name}</HelperText>}

            <TextInput
              label="Mobile Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.modalInput}
              error={!!errors.phone}
            />
            {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}

            <TextInput
              label="Village / Town"
              value={village}
              onChangeText={setVillage}
              style={styles.modalInput}
            />

            <TextInput
              label="Allowed Credit Limit (₹) *"
              value={creditLimit}
              onChangeText={setCreditLimit}
              keyboardType="numeric"
              style={styles.modalInput}
              error={!!errors.credit_limit}
            />
            {errors.credit_limit && <HelperText type="error">{errors.credit_limit}</HelperText>}

            <TextInput
              label="Landmarks / Notes"
              value={notes}
              onChangeText={setNotes}
              style={styles.modalInput}
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Full Address"
              value={address}
              onChangeText={setAddress}
              style={styles.modalInput}
              multiline
              numberOfLines={2}
            />

            <View style={styles.modalBtnRow}>
              <Button
                mode="outlined"
                onPress={() => setIsEditOpen(false)}
                style={{ flex: 1, marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdate}
                loading={saving}
                disabled={saving}
                style={{ flex: 1 }}
              >
                Save
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Record Credit Sale Modal */}
      {isRecordSaleOpen && shop?.id && (
        <RecordSaleForm
          shopId={shop.id}
          customerId={customer.id}
          onClose={() => setIsRecordSaleOpen(false)}
          onSave={handleSaveSale}
          isSubmitting={createSaleMutation.isPending}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loaderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 14,
  },
  balanceBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: '900',
    marginVertical: 10,
  },
  recordBtn: {
    width: '100%',
    marginBottom: 8,
  },
  reminderBtn: {
    width: '100%',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardSectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  detailsTextCol: {
    marginLeft: 12,
  },
  detailsLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  detailsVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 1,
  },
  notesText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  // Ledger log styles
  emptyLedgerText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 12,
  },
  ledgerLogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  ledgerLogMeta: {
    flex: 1,
  },
  ledgerLogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ledgerLogLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  ledgerLogDate: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  ledgerLogNotes: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  ledgerLogAmt: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },
  // Modal Edit styles
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  formErrorText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
  },
});
