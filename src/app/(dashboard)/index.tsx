import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  IconButton,
  Searchbar,
  FAB,
  Portal,
  Provider,
  useTheme,
  Card,
} from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { useShopQuery } from '../../hooks/useShop';
import { useCustomersQuery } from '../../hooks/useCustomers';
import { useDashboardMetricsQuery, useRecentActivitiesQuery } from '../../hooks/useDashboard';
import { useCreateSaleMutation } from '../../hooks/useSales';
import { RecordSaleForm } from '../../components/RecordSaleForm';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  UserPlus,
  ShoppingBag,
  CircleDollarSign,
  BookOpen,
  Bell,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react-native';
import { router } from 'expo-router';

export default function MobileDashboard() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { data: shop } = useShopQuery(user?.id);
  const { data: customers = [] } = useCustomersQuery(shop?.id);

  // Queries
  const { data: metrics, isLoading: isMetricsLoading } = useDashboardMetricsQuery(user?.id);
  const { data: activities = [], isLoading: isActivitiesLoading } = useRecentActivitiesQuery(
    user?.id
  );
  const createSaleMutation = useCreateSaleMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);

  // Dynamic Hour Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 👋';
    if (hour < 17) return 'Good Afternoon 👋';
    return 'Good Evening 👋';
  };

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'Add Customer') {
      router.push('/(dashboard)/customers' as any);
    } else if (actionId === 'Credit Sale') {
      setIsRecordSaleOpen(true);
    } else if (actionId === 'Receive Payment') {
      Alert.alert(
        'Coming Soon',
        'Receive Payment transaction wizard will be integrated in Phase 6.'
      );
    } else if (actionId === 'Customer Ledger') {
      router.push('/sales' as any);
    }
  };

  const handleSaveSale = async (payload: any) => {
    if (!shop?.id) return;
    await createSaleMutation.mutateAsync({
      shop_id: shop.id,
      ...payload,
    });
    setIsRecordSaleOpen(false);
    Alert.alert('Success', 'Credit sale has been recorded.');
  };

  return (
    <Provider>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greetingText}>{getGreeting()}</Text>
              <Text style={styles.shopNameText}>{shop?.shop_name || 'Loading Shop...'}</Text>
            </View>

            <View style={styles.headerIconGroup}>
              <IconButton
                icon={() => <Bell size={20} color={theme.colors.onSurface} />}
                onPress={() => Alert.alert('Notifications', 'No new alerts.')}
              />
              <TouchableOpacity onPress={() => router.push('/(dashboard)/settings' as any)}>
                {shop?.owner_photo_url ? (
                  <Avatar.Image size={36} source={{ uri: shop.owner_photo_url }} />
                ) : (
                  <Avatar.Icon size={36} icon="account" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Search bar */}
          <Searchbar
            placeholder="Search Customer..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchbarInput}
            onFocus={() => router.push('/(dashboard)/customers' as any)}
          />

          {/* Today's Summary Metrics */}
          {isMetricsLoading ? (
            <ActivityIndicator style={{ marginBottom: 24 }} color={theme.colors.primary} />
          ) : (
            <Surface style={styles.summaryCard} elevation={2}>
              <Text style={styles.summaryTitle}>Today&apos;s Summary</Text>

              <View style={styles.metricsRow}>
                <View style={styles.metricColumn}>
                  <Text style={styles.metricLabel}>Outstanding</Text>
                  <Text style={[styles.metricValue, { color: theme.colors.error }]}>
                    ₹{formatAmount(metrics?.outstandingCredit || 0)}
                  </Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricColumn}>
                  <Text style={styles.metricLabel}>Collection</Text>
                  <Text style={[styles.metricValue, { color: '#10b981' }]}>
                    ₹{formatAmount(metrics?.todayCollections || 0)}
                  </Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricColumn}>
                  <Text style={styles.metricLabel}>Sales</Text>
                  <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
                    ₹{formatAmount(metrics?.todaySales || 0)}
                  </Text>
                </View>
              </View>
            </Surface>
          )}

          {/* Quick Actions Grid */}
          <Text style={styles.sectionHeading}>Quick Operations</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleQuickAction('Add Customer')}
            >
              <Surface style={styles.actionIconBox} elevation={1}>
                <UserPlus size={22} color={theme.colors.primary} />
              </Surface>
              <Text style={styles.actionLabel}>Add Customer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleQuickAction('Credit Sale')}
            >
              <Surface style={styles.actionIconBox} elevation={1}>
                <ShoppingBag size={22} color="#f59e0b" />
              </Surface>
              <Text style={styles.actionLabel}>Credit Sale</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleQuickAction('Receive Payment')}
            >
              <Surface style={styles.actionIconBox} elevation={1}>
                <CircleDollarSign size={22} color="#10b981" />
              </Surface>
              <Text style={styles.actionLabel}>Collect Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => handleQuickAction('Customer Ledger')}
            >
              <Surface style={styles.actionIconBox} elevation={1}>
                <BookOpen size={22} color="#6366f1" />
              </Surface>
              <Text style={styles.actionLabel}>Sales Feed</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Activity stream */}
          <Text style={styles.sectionHeading}>Recent Ledger Logs</Text>
          {isActivitiesLoading ? (
            <ActivityIndicator style={{ marginVertical: 12 }} color={theme.colors.primary} />
          ) : activities.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13 }}>
                  No recent debit/credit logs recorded.
                </Text>
              </Card.Content>
            </Card>
          ) : (
            activities.map((act) => {
              const isSale = act.type === 'sale';
              return (
                <Surface key={act.id} style={styles.recentCustRow} elevation={1}>
                  <View style={styles.recentCustAvatarRow}>
                    <View
                      style={[
                        styles.activityIconBox,
                        {
                          backgroundColor: isSale
                            ? 'rgba(239, 68, 68, 0.08)'
                            : 'rgba(16, 185, 129, 0.08)',
                        },
                      ]}
                    >
                      {isSale ? (
                        <ArrowUpRight size={18} color={theme.colors.error} />
                      ) : (
                        <ArrowDownLeft size={18} color="#10b981" />
                      )}
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={styles.recentCustName}>{act.customerName}</Text>
                      <Text style={styles.recentCustSub}>
                        {isSale ? 'Credit Purchase' : 'Payment Cleared'} • {act.time}
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={[
                        styles.recentCustAmt,
                        { color: isSale ? theme.colors.error : '#10b981' },
                      ]}
                    >
                      {isSale ? '+' : '-'} ₹{formatAmount(act.amount)}
                    </Text>
                  </View>
                </Surface>
              );
            })
          )}
        </ScrollView>

        {/* Floating Action Button (FAB) Portal Menu */}
        <Portal>
          <FAB.Group
            open={fabOpen}
            visible
            icon={fabOpen ? 'close' : 'plus'}
            actions={[
              {
                icon: 'account-plus',
                label: 'Add Customer',
                onPress: () => router.push('/(dashboard)/customers' as any),
              },
              {
                icon: 'cart-plus',
                label: 'New Credit Sale',
                onPress: () => handleQuickAction('Credit Sale'),
              },
              {
                icon: 'cash-register',
                label: 'Collect Payment (UPI/Cash)',
                onPress: () => handleQuickAction('Receive Payment'),
              },
              {
                icon: 'file-document-outline',
                label: 'View Sales Log',
                onPress: () => handleQuickAction('Customer Ledger'),
              },
            ]}
            onStateChange={({ open }) => setFabOpen(open)}
            onPress={() => {
              if (fabOpen) {
                // do nothing
              }
            }}
            fabStyle={{ backgroundColor: theme.colors.primary }}
          />
        </Portal>

        {/* Record Credit Sale Wizard */}
        {isRecordSaleOpen && shop?.id && (
          <RecordSaleForm
            shopId={shop.id}
            onClose={() => setIsRecordSaleOpen(false)}
            onSave={handleSaveSale}
            isSubmitting={createSaleMutation.isPending}
          />
        )}
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100, // Extra padding for FAB
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  shopNameText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
    marginTop: 4,
  },
  headerIconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchbar: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginBottom: 20,
    elevation: 1,
  },
  searchbarInput: {
    fontSize: 14,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricColumn: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#cbd5e1',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  actionLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
    textAlign: 'center',
  },
  recentCustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  recentCustAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentCustName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  recentCustSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  recentCustAmt: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
});
