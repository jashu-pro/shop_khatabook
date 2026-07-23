import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useShopQuery } from '@/features/shop/hooks/useShop';
import { 
  useCustomersQuery, 
  useCreateCustomerMutation 
} from '../hooks/useCustomers';
import { Sidebar } from '@/features/dashboard/components/Sidebar';
import { TopBar } from '@/features/dashboard/components/TopBar';
import { CustomerCard } from '../components/CustomerCard';
import { CustomerForm } from '../components/CustomerForm';
import { 
  Plus, 
  Search, 
  MapPin, 
  Users, 
  UserPlus, 
  Sparkles,
  Loader2 
} from 'lucide-react';

export const CustomerList: React.FC = () => {
  const { user } = useAuthStore();
  const { data: shop } = useShopQuery(user?.id);
  
  // Queries & Mutations
  const { data: customers = [], isLoading } = useCustomersQuery(shop?.id);
  const createCustomerMutation = useCreateCustomerMutation();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Extract unique villages for search filtering
  const villages = Array.from(
    new Set(customers.map((c) => c.village).filter(Boolean))
  ) as string[];

  // Filter logic
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch = 
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cust.phone && cust.phone.includes(searchQuery)) ||
      (cust.village && cust.village.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVillage = 
      !selectedVillage || 
      (cust.village && cust.village.toLowerCase() === selectedVillage.toLowerCase());

    return matchesSearch && matchesVillage;
  });

  const handleSaveCustomer = async (payload: any) => {
    if (!shop?.id) return;
    await createCustomerMutation.mutateAsync({
      shop_id: shop.id,
      ...payload,
    });
    setIsFormOpen(false);
  };

  return (
    <div style={styles.layoutWrapper}>
      <Sidebar />

      <div style={styles.mainPane}>
        <TopBar />

        {/* Content Body */}
        <div style={styles.body}>
          {/* Header */}
          <div style={styles.headerRow}>
            <div style={styles.headerMeta}>
              <h2 style={styles.title}>Customer Ledger Notebooks</h2>
              <p style={styles.subtitle}>
                Manage credit notebooks, check limits, and review collection balances
              </p>
            </div>

            <button 
              onClick={() => setIsFormOpen(true)} 
              className="btn btn-primary"
              style={styles.addBtn}
              disabled={isLoading || !shop?.id}
            >
              <Plus size={16} />
              <span>Add Customer</span>
            </button>
          </div>

          {/* Search Controls */}
          {customers.length > 0 && (
            <div style={styles.searchBar} className="glass-panel animate-fade-in">
              <div style={styles.searchInputWrapper}>
                <Search size={18} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by name, mobile, or village..."
                  className="input-field"
                  style={{ paddingLeft: '44px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {villages.length > 0 && (
                <div style={styles.selectWrapper}>
                  <MapPin size={16} style={styles.selectIcon} />
                  <select
                    className="input-field"
                    style={{ paddingLeft: '38px', appearance: 'none', backgroundPosition: 'right 12px center' }}
                    value={selectedVillage}
                    onChange={(e) => setSelectedVillage(e.target.value)}
                  >
                    <option value="">All Villages</option>
                    {villages.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Results Grid */}
          {isLoading ? (
            <div style={styles.loadingBox}>
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Loading customer accounts...
              </span>
            </div>
          ) : customers.length === 0 ? (
            /* Root Empty State */
            <div style={styles.emptyContainer} className="glass-panel animate-fade-in">
              <div style={styles.emptyIconBox}>
                <Users size={32} style={{ color: 'var(--primary)' }} />
              </div>
              <h3 style={styles.emptyTitle}>No customer data yet</h3>
              <p style={styles.emptyDesc}>
                Your digital khata notebook is currently empty. Start by adding your first customer to record sales.
              </p>
              <button 
                onClick={() => setIsFormOpen(true)} 
                className="btn btn-primary"
                style={{ marginTop: '16px', padding: '12px 24px' }}
              >
                <UserPlus size={16} style={{ marginRight: '8px' }} />
                <span>Add Your First Customer</span>
              </button>
            </div>
          ) : filteredCustomers.length === 0 ? (
            /* Search Empty State */
            <div style={styles.emptyContainer} className="glass-panel animate-fade-in">
              <div style={styles.emptyIconBox}>
                <Search size={32} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 style={styles.emptyTitle}>No matching customers</h3>
              <p style={styles.emptyDesc}>
                No customers match your search criteria. Try a different search query or filter.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedVillage('');
                }} 
                className="btn btn-outline"
                style={{ marginTop: '16px', padding: '10px 20px' }}
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredCustomers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customer Form Modal */}
      {isFormOpen && shop?.id && (
        <CustomerForm
          shopId={shop.id}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveCustomer}
          isSubmitting={createCustomerMutation.isPending}
        />
      )}
    </div>
  );
};

const styles = {
  layoutWrapper: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'var(--bg-primary)',
    padding: '16px',
    gap: '16px',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  mainPane: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
  } as React.CSSProperties,
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  } as React.CSSProperties,
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '4px 0',
  } as React.CSSProperties,
  headerMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as React.CSSProperties,
  title: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
  } as React.CSSProperties,
  searchBar: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    borderRadius: 'var(--radius-sm)',
    flexWrap: 'wrap',
  } as React.CSSProperties,
  searchInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    minWidth: '240px',
  } as React.CSSProperties,
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  } as React.CSSProperties,
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: '180px',
  } as React.CSSProperties,
  selectIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
    zIndex: 2,
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
    width: '100%',
  } as React.CSSProperties,
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '80px 0',
  } as React.CSSProperties,
  // Empty State
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '60px 24px',
    gap: '8px',
  } as React.CSSProperties,
  emptyIconBox: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  } as React.CSSProperties,
  emptyTitle: {
    fontSize: '1rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  emptyDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    maxWidth: '300px',
    lineHeight: '1.4',
  } as React.CSSProperties,
};
