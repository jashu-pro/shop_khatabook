import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Surface,
  Avatar,
  IconButton,
  useTheme,
  Divider,
  Checkbox,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCustomersQuery } from '../hooks/useCustomers';
import { useCustomerBalanceQuery } from '../hooks/useSales';
import { ImageUploader } from './ImageUploader';
import {
  X,
  Search,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  User,
  UserCheck,
} from 'lucide-react-native';
import { customerService } from 'shared';

interface RecordSaleFormProps {
  shopId: string;
  customerId?: string; // Preselected customer ID (if opened from customer notebook)
  onClose: () => void;
  onSave: (payload: {
    customer_id: string;
    total_amount: number;
    notes: string;
    bill_photo_url: string | null;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const RecordSaleForm: React.FC<RecordSaleFormProps> = ({
  shopId,
  customerId: initialCustomerId,
  onClose,
  onSave,
  isSubmitting,
}) => {
  const theme = useTheme();

  // Queries
  const { data: customers = [], isLoading: isCustomersLoading } = useCustomersQuery(shopId);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    initialCustomerId || null
  );
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [billPhotoBase64, setBillPhotoBase64] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(initialCustomerId ? 2 : 1);
  const [overrideLimit, setOverrideLimit] = useState(false);

  // Fetch balance for the selected customer
  const { data: balanceData } = useCustomerBalanceQuery(selectedCustomerId || undefined);
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const currentOutstanding = balanceData?.outstanding_credit || 0;
  const creditLimit = selectedCustomer?.credit_limit || 0;
  const saleAmount = parseFloat(amount) || 0;
  const newOutstanding = currentOutstanding + saleAmount;
  const isLimitExceeded = newOutstanding > creditLimit;

  // Reset override checked state if amount changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOverrideLimit(false);
  }, [amount]);

  // Filter customers matching query
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.village && c.village.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      Alert.alert('Error', 'Please select a customer first.');
      return;
    }
    if (saleAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid credit amount.');
      return;
    }
    if (isLimitExceeded && !overrideLimit) {
      Alert.alert(
        'Limit Exceeded',
        "This sale will exceed the customer's credit limit. Please check the override checkbox to proceed."
      );
      return;
    }

    try {
      await onSave({
        customer_id: selectedCustomerId,
        total_amount: saleAmount,
        notes: notes,
        bill_photo_url: billPhotoBase64,
      });
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Failed to record transaction.');
    }
  };

  return (
    <Modal visible={true} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <Surface style={styles.header} elevation={1}>
          <IconButton
            icon={() => <X size={20} color={theme.colors.onSurface} />}
            onPress={onClose}
          />
          <Text style={styles.headerTitle}>Record Credit Sale</Text>
          <View style={{ width: 48 }} />
        </Surface>

        {step === 1 ? (
          /* Step 1: Customer Lookup */
          <View style={styles.stepContainer}>
            <Text style={styles.sectionLabel}>Select Debtor Account</Text>
            <TextInput
              mode="outlined"
              placeholder="Search by name, phone or village..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              left={
                <TextInput.Icon
                  icon={() => <Search size={18} color={theme.colors.onSurfaceVariant} />}
                />
              }
              style={styles.searchInput}
            />

            {isCustomersLoading ? (
              <ActivityIndicator style={{ marginTop: 24 }} color={theme.colors.primary} />
            ) : filteredCustomers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No matching customers found in ledger</Text>
              </View>
            ) : (
              <ScrollView style={styles.customerList} keyboardShouldPersistTaps="handled">
                {filteredCustomers.map((customer) => (
                  <TouchableOpacity
                    key={customer.id}
                    onPress={() => handleSelectCustomer(customer.id)}
                    style={styles.customerItem}
                  >
                    {customer.photo_url ? (
                      <Avatar.Image size={40} source={{ uri: customer.photo_url }} />
                    ) : (
                      <Avatar.Icon
                        size={40}
                        icon="account"
                        style={{ backgroundColor: theme.colors.surfaceVariant }}
                      />
                    )}
                    <View style={styles.customerMeta}>
                      <Text style={styles.customerName}>{customer.name}</Text>
                      <Text style={styles.customerSub}>
                        {customer.phone || 'No Phone'} • {customer.village || 'No Village'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          /* Step 2: Form Parameters & Verification */
          <ScrollView
            style={styles.stepContainer}
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Customer Snippet */}
            {selectedCustomer && (
              <Surface style={styles.customerSnippet} elevation={1}>
                <View style={styles.snippetRow}>
                  {selectedCustomer.photo_url ? (
                    <Avatar.Image size={44} source={{ uri: selectedCustomer.photo_url }} />
                  ) : (
                    <Avatar.Icon size={44} icon="account" />
                  )}
                  <View style={styles.snippetMeta}>
                    <Text style={styles.snippetName}>{selectedCustomer.name}</Text>
                    <Text style={styles.snippetSub}>{selectedCustomer.phone || 'No Mobile'}</Text>
                  </View>
                  {!initialCustomerId && (
                    <Button compact mode="text" onPress={() => setStep(1)}>
                      Change
                    </Button>
                  )}
                </View>
              </Surface>
            )}

            <TextInput
              mode="outlined"
              label="Transaction Amount (₹)"
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              style={styles.formInput}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />

            <TextInput
              mode="outlined"
              label="Items Description / Notes"
              placeholder="e.g. 5 bags cement, urea fertilizer..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={styles.formInput}
            />

            {/* Bill Uploader */}
            <ImageUploader
              value={billPhotoBase64}
              onChange={setBillPhotoBase64}
              label="Scan/Upload Invoice Copy"
              shape="square"
            />

            {/* Credit Limit Verification Box */}
            {saleAmount > 0 && selectedCustomer && (
              <Surface style={styles.checkCard} elevation={1}>
                <Text style={styles.checkCardTitle}>Credit Boundary Review</Text>

                <View style={styles.checkGrid}>
                  <View style={styles.checkCell}>
                    <Text style={styles.checkCellLabel}>Current Debt</Text>
                    <Text style={styles.checkCellVal}>₹{formatAmount(currentOutstanding)}</Text>
                  </View>
                  <View style={styles.checkCell}>
                    <Text style={styles.checkCellLabel}>Allowed Limit</Text>
                    <Text style={styles.checkCellVal}>₹{formatAmount(creditLimit)}</Text>
                  </View>
                </View>

                <Divider style={{ marginVertical: 8 }} />

                <View style={styles.checkRow}>
                  <Text style={styles.projectedLabel}>Projected Outstanding</Text>
                  <Text
                    style={[
                      styles.projectedVal,
                      { color: isLimitExceeded ? theme.colors.error : theme.colors.primary },
                    ]}
                  >
                    ₹{formatAmount(newOutstanding)}
                  </Text>
                </View>

                {isLimitExceeded ? (
                  <View
                    style={[
                      styles.alertBox,
                      { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
                    ]}
                  >
                    <View style={styles.alertHeader}>
                      <AlertTriangle size={16} color={theme.colors.error} />
                      <Text style={[styles.alertTitle, { color: theme.colors.error }]}>
                        Credit Limit Exceeded
                      </Text>
                    </View>
                    <Text style={styles.alertDesc}>
                      Recording this credit transaction will exceed this customer&apos;s boundary
                      limit.
                    </Text>

                    <View style={styles.checkboxRow}>
                      <Checkbox
                        status={overrideLimit ? 'checked' : 'unchecked'}
                        onPress={() => setOverrideLimit(!overrideLimit)}
                        color={theme.colors.error}
                      />
                      <TouchableOpacity onPress={() => setOverrideLimit(!overrideLimit)}>
                        <Text style={styles.checkboxText}>
                          Override limit restriction & proceed
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.alertBox,
                      { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
                    ]}
                  >
                    <View style={styles.alertHeader}>
                      <CheckCircle2 size={16} color="#15803d" />
                      <Text style={[styles.alertTitle, { color: '#15803d' }]}>
                        Within Credit limit
                      </Text>
                    </View>
                  </View>
                )}
              </Surface>
            )}

            {/* Footer Buttons */}
            <View style={styles.footerRow}>
              <Button mode="outlined" onPress={onClose} style={{ flex: 1 }} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={{ flex: 1 }}
                disabled={isSubmitting || saleAmount <= 0 || (isLimitExceeded && !overrideLimit)}
                loading={isSubmitting}
              >
                Save Log
              </Button>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  stepContainer: {
    flex: 1,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
  customerList: {
    flex: 1,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  customerMeta: {
    marginLeft: 12,
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  customerSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  // Step 2 Form
  customerSnippet: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  snippetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  snippetMeta: {
    marginLeft: 12,
    flex: 1,
  },
  snippetName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  snippetSub: {
    fontSize: 12,
    color: '#64748b',
  },
  formInput: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  checkCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 16,
    marginBottom: 16,
  },
  checkCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  checkGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  checkCell: {
    flex: 1,
  },
  checkCellLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  checkCellVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  checkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  projectedLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  projectedVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  alertBox: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginTop: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  alertDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 14,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: -8,
  },
  checkboxText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
});
