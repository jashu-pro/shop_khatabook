import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  Image, 
  Modal, 
  ActivityIndicator 
} from 'react-native';
import { 
  Text, 
  Surface, 
  Searchbar, 
  FAB, 
  Portal, 
  IconButton, 
  useTheme, 
  Card,
  Avatar 
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useShopQuery } from '../hooks/useShop';
import { 
  useSalesQuery, 
  useCreateSaleMutation, 
  useDeleteSaleMutation 
} from '../hooks/useSales';
import { RecordSaleForm } from '../components/RecordSaleForm';
import { 
  ArrowLeft, 
  Calendar, 
  Trash2, 
  FileImage, 
  ShoppingBag, 
  Search, 
  Plus, 
  X 
} from 'lucide-react-native';
import { router } from 'expo-router';

export default function SalesListScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { data: shop } = useShopQuery(user?.id);

  // Queries
  const { data: sales = [], isLoading } = useSalesQuery(shop?.id);
  const createSaleMutation = useCreateSaleMutation();
  const deleteSaleMutation = useDeleteSaleMutation();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | '7days'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeBillUrl, setActiveBillUrl] = useState<string | null>(null);

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const handleSaveSale = async (payload: any) => {
    if (!shop?.id) return;
    await createSaleMutation.mutateAsync({
      shop_id: shop.id,
      ...payload,
    });
    setIsFormOpen(false);
    Alert.alert('Success', 'Credit sale transaction logged successfully.');
  };

  const handleDeleteSale = (saleId: string, customerId: string, customerName: string, amount: number) => {
    if (!shop?.id) return;
    
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete this credit sale of ₹${formatAmount(amount)} for ${customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSaleMutation.mutateAsync({
                saleId,
                customerId,
                shopId: shop.id,
              });
              Alert.alert('Deleted', 'Sale log removed.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete transaction.');
            }
          }
        }
      ]
    );
  };

  // Filter logic
  const filteredSales = sales.filter(sale => {
    // Text search
    const customerName = sale.customers?.name || '';
    const notes = sale.notes || '';
    const saleNum = sale.sale_number || '';
    const matchesText = 
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      saleNum.toLowerCase().includes(searchQuery.toLowerCase());

    // Date filters
    const saleDate = new Date(sale.sale_date);
    const today = new Date();
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = saleDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      matchesDate = saleDate.toDateString() === yesterday.toDateString();
    } else if (dateFilter === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      matchesDate = saleDate >= sevenDaysAgo;
    }

    return matchesText && matchesDate;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <Surface style={styles.header} elevation={1}>
        <IconButton 
          icon={() => <ArrowLeft size={20} color={theme.colors.onSurface} />} 
          onPress={() => router.back()}
        />
        <Text style={styles.headerTitle}>Credit Sales Feed</Text>
        <IconButton 
          icon="plus" 
          iconColor={theme.colors.primary} 
          onPress={() => setIsFormOpen(true)}
        />
      </Surface>

      {/* Filters & Search Row */}
      <View style={styles.filtersWrapper}>
        <Searchbar
          placeholder="Search customer name or bill..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchbarInput}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateFiltersRow}>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7days', label: 'Last 7 Days' },
          ].map(btn => (
            <TouchableOpacity
              key={btn.id}
              onPress={() => setDateFilter(btn.id as any)}
              style={[
                styles.filterBadge,
                dateFilter === btn.id && { backgroundColor: theme.colors.primary }
              ]}
            >
              <Text style={[
                styles.filterBadgeText,
                dateFilter === btn.id && { color: theme.colors.onPrimary, fontWeight: '700' }
              ]}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sales log list */}
      {isLoading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loaderText}>Loading sales feed...</Text>
        </View>
      ) : filteredSales.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ShoppingBag size={48} color="#94a3b8" />
          <Text style={styles.emptyTitle}>No credit sales logged</Text>
          <Text style={styles.emptyDesc}>
            No entries match your search filters. Click the "+" button below to log a sale.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredSales}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <Card style={styles.saleCard} elevation={1}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.avatarCol}>
                  {item.customers?.photo_url ? (
                    <Avatar.Image size={40} source={{ uri: item.customers.photo_url }} />
                  ) : (
                    <Avatar.Icon size={40} icon="account" />
                  )}
                </View>

                <View style={styles.detailsCol}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.customerName}>{item.customers?.name || 'Deleted customer'}</Text>
                    <Text style={styles.amountText}>₹{formatAmount(item.total_amount)}</Text>
                  </View>

                  <Text style={styles.billNumber}>{item.sale_number}</Text>
                  <Text style={styles.notesText} numberOfLines={2}>
                    {item.notes || 'No description notes'}
                  </Text>

                  <View style={styles.metaRow}>
                    <Text style={styles.dateText}>
                      {new Date(item.sale_date).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>

                    <View style={styles.actionButtons}>
                      {item.bill_photo_url && (
                        <IconButton 
                          icon={() => <FileImage size={16} color={theme.colors.primary} />}
                          onPress={() => setActiveBillUrl(item.bill_photo_url)}
                          style={styles.actionIconButton}
                        />
                      )}
                      <IconButton 
                        icon={() => <Trash2 size={16} color={theme.colors.error} />}
                        onPress={() => handleDeleteSale(item.id, item.customer_id, item.customers?.name || 'Debtor', item.total_amount)}
                        style={styles.actionIconButton}
                      />
                    </View>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
        />
      )}

      {/* Floating Action Button */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        color={theme.colors.onPrimary}
        onPress={() => setIsFormOpen(true)}
      />

      {/* Invoice Image Preview Lightbox */}
      {activeBillUrl && (
        <Modal visible={true} transparent={true} animationType="fade">
          <View style={styles.lightboxBackdrop}>
            <View style={styles.lightboxContent}>
              <IconButton 
                icon={() => <X size={24} color="#fff" />} 
                style={styles.lightboxClose}
                onPress={() => setActiveBillUrl(null)}
              />
              <Image 
                source={{ uri: activeBillUrl }} 
                style={styles.lightboxImage} 
                resizeMode="contain" 
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Record Credit Sale Form Overlay */}
      {isFormOpen && shop?.id && (
        <RecordSaleForm
          shopId={shop.id}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveSale}
          isSubmitting={createSaleMutation.isPending}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  filtersWrapper: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchbar: {
    backgroundColor: '#f1f5f9',
    elevation: 0,
    height: 44,
    marginBottom: 8,
  },
  searchbarInput: {
    minHeight: 44,
  },
  dateFiltersRow: {
    paddingVertical: 4,
    gap: 8,
  },
  filterBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    marginRight: 6,
  },
  filterBadgeText: {
    fontSize: 12,
    color: '#475569',
  },
  loaderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  listContainer: {
    padding: 12,
    paddingBottom: 88,
  },
  saleCard: {
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardContent: {
    flexDirection: 'row',
  },
  avatarCol: {
    marginRight: 12,
  },
  detailsCol: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ef4444', // Credit is highlighted in red
  },
  billNumber: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#64748b',
    marginTop: 2,
  },
  notesText: {
    fontSize: 13,
    color: '#334155',
    marginTop: 6,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconButton: {
    margin: 0,
    padding: 0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  // Lightbox
  lightboxBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxContent: {
    position: 'relative',
    width: '90%',
    height: '80%',
  },
  lightboxClose: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  lightboxImage: {
    width: '100%',
    height: '100%',
  },
});
