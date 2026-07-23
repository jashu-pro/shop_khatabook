import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useShopQuery } from '@/features/shop/hooks/useShop';
import { 
  useCustomerDetailQuery, 
  useUpdateCustomerMutation, 
  useDeleteCustomerMutation 
} from '../hooks/useCustomers';
import {
  useCustomerBalanceQuery,
  useCustomerLedgerQuery,
  useCreateSaleMutation
} from '@/features/sales/hooks/useSales';
import { Sidebar } from '@/features/dashboard/components/Sidebar';
import { TopBar } from '@/features/dashboard/components/TopBar';
import { CustomerForm } from '../components/CustomerForm';
import { RecordSaleForm } from '@/features/sales/components/RecordSaleForm';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  Notebook, 
  Send, 
  Edit2, 
  Trash2, 
  AlertTriangle,
  Loader2,
  Calendar,
  Wallet,
  Plus,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

export const CustomerDetail: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: shop } = useShopQuery(user?.id);

  // Queries & Mutations
  const { data: customer, isLoading } = useCustomerDetailQuery(customerId);
  const updateCustomerMutation = useUpdateCustomerMutation();
  const deleteCustomerMutation = useDeleteCustomerMutation();
  const createSaleMutation = useCreateSaleMutation();

  // Dynamic Ledger Balance & History
  const { data: balanceData } = useCustomerBalanceQuery(customerId);
  const { data: ledgerData = { sales: [], payments: [] } } = useCustomerLedgerQuery(customerId);
  
  const outstandingCredit = balanceData?.outstanding_credit || 0;

  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdateCustomer = async (payload: any) => {
    if (!customerId || !shop?.id) return;
    await updateCustomerMutation.mutateAsync({
      customerId,
      input: payload,
      shopId: shop.id,
    });
    setIsEditFormOpen(false);
  };

  const handleDeleteCustomer = async () => {
    if (!customerId || !shop?.id) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${customer?.name || 'this customer'}? This action will permanently wipe their ledger notebook.`
    );
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      await deleteCustomerMutation.mutateAsync({
        customerId,
        shopId: shop.id,
      });
      navigate('/customers', { replace: true });
    } catch (err) {
      console.error('Delete error:', err);
      setDeleting(false);
    }
  };

  const handleSaveSale = async (payload: any) => {
    if (!shop?.id || !customerId) return;
    await createSaleMutation.mutateAsync({
      shop_id: shop.id,
      customer_id: customerId,
      ...payload,
    });
    setIsRecordSaleOpen(false);
  };

  const getWhatsAppLink = (): string => {
    if (!customer?.phone) return '';
    
    const formattedPhone = customer.phone.startsWith('91') || customer.phone.length > 10
      ? customer.phone 
      : `91${customer.phone}`;
      
    const shopName = shop?.shop_name || 'our store';
    const msg = `Dear ${customer.name}, this is a friendly reminder from ${shopName} that your outstanding credit balance in our ledger is ₹${formatAmount(outstandingCredit)}. Please clear it at your earliest convenience. Thank you!`;
    
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
  };

  if (isLoading) {
    return (
      <div style={styles.layoutWrapper}>
        <Sidebar />
        <div style={styles.mainPane}>
          <TopBar />
          <div style={styles.loadingBox}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Loading customer notebook...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div style={styles.layoutWrapper}>
        <Sidebar />
        <div style={styles.mainPane}>
          <TopBar />
          <div style={styles.errorContainer} className="glass-panel animate-fade-in">
            <AlertTriangle size={32} style={{ color: 'var(--danger)' }} />
            <h3 style={styles.errorTitle}>Customer Not Found</h3>
            <p style={styles.errorDesc}>
              This customer account does not exist or has been removed from your shop's ledger.
            </p>
            <Link to="/customers" style={styles.backLinkBtn} className="btn btn-primary">
              <ArrowLeft size={16} />
              <span>Back to Customers</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Combine sales and payments into a unified chronology ledger
  const ledgerChronology = [
    ...ledgerData.sales.map(s => ({ ...s, entryType: 'sale' as const })),
    ...ledgerData.payments.map(p => ({ ...p, entryType: 'payment' as const }))
  ].sort((a, b) => {
    const dateA = new Date(a.entryType === 'sale' ? a.sale_date : a.payment_date).getTime();
    const dateB = new Date(b.entryType === 'sale' ? b.sale_date : b.payment_date).getTime();
    return dateB - dateA; // Newest first
  });

  return (
    <div style={styles.layoutWrapper}>
      <Sidebar />

      <div style={styles.mainPane}>
        <TopBar />

        {/* Detail Content */}
        <div style={styles.body} className="animate-fade-in">
          {/* Back link */}
          <Link to="/customers" style={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Customers List</span>
          </Link>

          <div style={styles.grid}>
            {/* Left: Info Card */}
            <div style={styles.infoCard} className="glass-panel">
              <div style={styles.profileHeader}>
                {customer.photo_url ? (
                  <img src={customer.photo_url} alt={customer.name} style={styles.avatar} />
                ) : (
                  <div style={styles.avatarPlaceholder}>
                    <User size={36} style={{ color: 'var(--primary)' }} />
                  </div>
                )}
                
                <div style={styles.profileText}>
                  <h2 style={styles.customerName}>{customer.name}</h2>
                  <span style={styles.createdDate}>
                    <Calendar size={12} />
                    <span>Added {new Date(customer.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </span>
                </div>
              </div>

              <div style={styles.divider} />

              {/* Outstanding Balance Box */}
              <div style={styles.balanceBox}>
                <span style={styles.balanceLabel}>Outstanding Balance</span>
                <span 
                  style={{ 
                    ...styles.balanceValue,
                    color: outstandingCredit > 0 ? 'var(--danger)' : 'var(--text-muted)' 
                  }}
                >
                  ₹{formatAmount(outstandingCredit)}
                </span>
                
                {/* Record Sale Action */}
                <button 
                  onClick={() => setIsRecordSaleOpen(true)} 
                  className="btn btn-primary"
                  style={styles.recordSaleBtn}
                  disabled={!shop?.id}
                >
                  <Plus size={14} />
                  <span>Record Credit Sale</span>
                </button>

                {customer.phone ? (
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{
                      ...styles.whatsappBtn,
                      opacity: outstandingCredit > 0 ? 1 : 0.5,
                      pointerEvents: outstandingCredit > 0 ? 'auto' : 'none',
                    }}
                    title={outstandingCredit > 0 ? 'Send reminder' : 'No outstanding amount to remind'}
                  >
                    <Send size={14} />
                    <span>Send WhatsApp Reminder</span>
                  </a>
                ) : (
                  <button 
                    disabled 
                    className="btn btn-outline" 
                    style={{ ...styles.whatsappBtn, opacity: 0.4 }}
                    title="No mobile number registered"
                  >
                    <Send size={14} />
                    <span>No WhatsApp Phone Number</span>
                  </button>
                )}
              </div>

              <div style={styles.divider} />

              {/* Profile Details List */}
              <div style={styles.detailsList}>
                <div style={styles.detailsItem}>
                  <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                  <div style={styles.detailsText}>
                    <span style={styles.detailsLabel}>Mobile Phone</span>
                    <span style={styles.detailsValue}>{customer.phone || 'N/A'}</span>
                  </div>
                </div>

                <div style={styles.detailsItem}>
                  <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                  <div style={styles.detailsText}>
                    <span style={styles.detailsLabel}>Village / Town</span>
                    <span style={styles.detailsValue}>{customer.village || 'N/A'}</span>
                  </div>
                </div>

                <div style={styles.detailsItem}>
                  <Wallet size={16} style={{ color: 'var(--text-muted)' }} />
                  <div style={styles.detailsText}>
                    <span style={styles.detailsLabel}>Allowed Credit Limit</span>
                    <span style={styles.detailsValue}>₹{formatAmount(customer.credit_limit)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Notes, Addresses & Ledger Log Chronology */}
            <div style={styles.notesSection} className="glass-panel">
              <div style={styles.actionsHeader}>
                <h3 style={styles.notesTitle}>Ledger Details & Information</h3>
                
                <div style={styles.actionsBtnGroup}>
                  <button 
                    onClick={() => setIsEditFormOpen(true)} 
                    className="btn btn-outline"
                    style={styles.actionIconBtn}
                    title="Edit profile"
                  >
                    <Edit2 size={15} />
                    <span>Edit</span>
                  </button>
                  
                  <button 
                    onClick={handleDeleteCustomer} 
                    className="btn btn-outline"
                    style={{ ...styles.actionIconBtn, color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    disabled={deleting}
                    title="Delete customer"
                  >
                    {deleting ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div style={styles.divider} />

              <div style={styles.metaTextGroup}>
                <h4 style={styles.metaHeading}>Notes</h4>
                <p style={styles.notesContent}>
                  {customer.notes || 'No description notes recorded for this customer.'}
                </p>
              </div>

              <div style={{ ...styles.metaTextGroup, marginTop: '14px' }}>
                <h4 style={styles.metaHeading}>Full Billing Address</h4>
                <p style={styles.notesContent}>
                  {customer.address || 'No physical address details registered.'}
                </p>
              </div>

              <div style={{ ...styles.divider, margin: '16px 0' }} />

              {/* Transactions logs list */}
              <div style={styles.ledgerSection}>
                <h4 style={styles.metaHeading}>Chronological Ledger Log</h4>
                
                {ledgerChronology.length === 0 ? (
                  <div style={styles.emptyLedger}>
                    <ShoppingBag size={24} style={{ color: 'var(--text-muted)', marginBottom: '6px' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      No transactions recorded yet
                    </span>
                  </div>
                ) : (
                  <div style={styles.ledgerList}>
                    {ledgerChronology.map((entry) => {
                      const isSale = entry.entryType === 'sale';
                      const amount = isSale ? entry.total_amount : entry.payment_amount;
                      const date = isSale ? entry.sale_date : entry.payment_date;
                      const label = isSale 
                        ? `Credit Sale (${entry.sale_number})` 
                        : `Payment Received (${entry.payment_method?.toUpperCase()})`;
                      const notesText = entry.notes || '';
                      
                      return (
                        <div key={entry.id} style={styles.ledgerItem} className="hover-grow">
                          <div style={styles.ledgerItemMeta}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {isSale ? (
                                <ArrowUpRight size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                              ) : (
                                <ArrowDownLeft size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                              )}
                              <span style={styles.ledgerItemLabel}>{label}</span>
                            </div>
                            <span style={styles.ledgerItemDate}>
                              {new Date(date).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {notesText && <span style={styles.ledgerItemNotes}>{notesText}</span>}
                          </div>
                          
                          <span 
                            style={{ 
                              ...styles.ledgerItemAmount, 
                              color: isSale ? 'var(--danger)' : 'var(--success)'
                            }}
                          >
                            {isSale ? '+' : '-'} ₹{formatAmount(amount)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {isEditFormOpen && shop?.id && (
        <CustomerForm
          customer={customer}
          shopId={shop.id}
          onClose={() => setIsEditFormOpen(false)}
          onSave={handleUpdateCustomer}
          isSubmitting={updateCustomerMutation.isPending}
        />
      )}

      {/* Record Sale Modal */}
      {isRecordSaleOpen && shop?.id && (
        <RecordSaleForm
          customerId={customer.id}
          shopId={shop.id}
          onClose={() => setIsRecordSaleOpen(false)}
          onSave={handleSaveSale}
          isSubmitting={createSaleMutation.isPending}
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
    gap: '14px',
    width: '100%',
  } as React.CSSProperties,
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    width: 'fit-content',
    transition: 'color var(--transition-fast)',
  } as React.CSSProperties,
  grid: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    width: '100%',
  } as React.CSSProperties,
  infoCard: {
    flex: '1 1 300px',
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignSelf: 'flex-start',
  } as React.CSSProperties,
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid var(--border-color)',
  } as React.CSSProperties,
  avatarPlaceholder: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  profileText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as React.CSSProperties,
  customerName: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  createdDate: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  } as React.CSSProperties,
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'var(--border-color)',
  } as React.CSSProperties,
  balanceBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    gap: '8px',
    textAlign: 'center',
  } as React.CSSProperties,
  balanceLabel: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  } as React.CSSProperties,
  balanceValue: {
    fontSize: '1.8rem',
    fontWeight: '800',
    letterSpacing: '-0.02em',
  } as React.CSSProperties,
  recordSaleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    fontSize: '0.8rem',
    width: '100%',
    marginBottom: '4px',
  } as React.CSSProperties,
  whatsappBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    fontSize: '0.8rem',
    width: '100%',
    textDecoration: 'none',
  } as React.CSSProperties,
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  } as React.CSSProperties,
  detailsItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,
  detailsText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  } as React.CSSProperties,
  detailsLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  } as React.CSSProperties,
  detailsValue: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  notesSection: {
    flex: '2 1 400px',
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as React.CSSProperties,
  actionsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  } as React.CSSProperties,
  notesTitle: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  actionsBtnGroup: {
    display: 'flex',
    gap: '8px',
  } as React.CSSProperties,
  actionIconBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    fontSize: '0.75rem',
  } as React.CSSProperties,
  metaTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  } as React.CSSProperties,
  metaHeading: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    marginBottom: '8px',
  } as React.CSSProperties,
  notesContent: {
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    lineHeight: '1.5',
  } as React.CSSProperties,
  // Ledger section styling
  ledgerSection: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  } as React.CSSProperties,
  emptyLedger: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 10px',
    border: '1px dashed var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-tertiary)',
  } as React.CSSProperties,
  ledgerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '320px',
    overflowY: 'auto',
    paddingRight: '4px',
  } as React.CSSProperties,
  ledgerItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    gap: '12px',
  } as React.CSSProperties,
  ledgerItemMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflow: 'hidden',
  } as React.CSSProperties,
  ledgerItemLabel: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,
  ledgerItemDate: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
  } as React.CSSProperties,
  ledgerItemNotes: {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    marginTop: '2px',
    lineHeight: '1.4',
  } as React.CSSProperties,
  ledgerItemAmount: {
    fontSize: '0.95rem',
    fontWeight: '800',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,
  // Loaders & Errors
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '120px 0',
  } as React.CSSProperties,
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '60px 24px',
    gap: '12px',
    maxWidth: '460px',
    alignSelf: 'center',
    marginTop: '40px',
  } as React.CSSProperties,
  errorTitle: {
    fontSize: '1rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  errorDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  } as React.CSSProperties,
  backLinkBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    textDecoration: 'none',
    marginTop: '12px',
  } as React.CSSProperties,
};
