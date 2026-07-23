import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useShopQuery } from '@/features/shop/hooks/useShop';
import { useSalesQuery, useCreateSaleMutation, useDeleteSaleMutation } from '../hooks/useSales';
import { Sidebar } from '@/features/dashboard/components/Sidebar';
import { TopBar } from '@/features/dashboard/components/TopBar';
import { RecordSaleForm } from '../components/RecordSaleForm';
import { 
  Plus, 
  Search, 
  Calendar, 
  ShoppingBag, 
  FileImage, 
  Trash2, 
  Loader2, 
  ChevronRight,
  ArrowRight,
  Eye,
  X
} from 'lucide-react';

export const SalesList: React.FC = () => {
  const { user } = useAuthStore();
  const { data: shop } = useShopQuery(user?.id);
  
  // Queries
  const { data: sales = [], isLoading } = useSalesQuery(shop?.id);
  const createSaleMutation = useCreateSaleMutation();
  const deleteSaleMutation = useDeleteSaleMutation();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, yesterday, 7days, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
  };

  const handleDeleteSale = async (saleId: string, customerId: string, customerName: string, amount: number) => {
    if (!shop?.id) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this credit sale of ₹${formatAmount(amount)} for ${customerName}? This will deduct the amount from their outstanding balance.`
    );
    if (!confirmDelete) return;

    try {
      await deleteSaleMutation.mutateAsync({
        saleId,
        customerId,
        shopId: shop.id,
      });
    } catch (err) {
      console.error('Error deleting sale:', err);
    }
  };

  // Filtering calculations
  const filteredSales = sales.filter((sale) => {
    // 1. Text filter
    const customerName = sale.customers?.name || '';
    const notes = sale.notes || '';
    const matchesSearch = 
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.sale_number.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Date filters
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
    } else if (dateFilter === 'custom') {
      if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = saleDate >= start && saleDate <= end;
      }
    }

    return matchesSearch && matchesDate;
  });

  return (
    <div style={styles.layoutWrapper}>
      <Sidebar />

      <div style={styles.mainPane}>
        <TopBar />

        {/* Sales List Body */}
        <div style={styles.body}>
          {/* Header Row */}
          <div style={styles.headerRow}>
            <div style={styles.headerMeta}>
              <h2 style={styles.title}>Credit Sales Feed</h2>
              <p style={styles.subtitle}>
                Track and log customer credit purchases, scan bills, and review transaction ledgers
              </p>
            </div>

            <button 
              onClick={() => setIsFormOpen(true)} 
              className="btn btn-primary"
              style={styles.addBtn}
              disabled={isLoading || !shop?.id}
            >
              <Plus size={16} />
              <span>Record Credit Sale</span>
            </button>
          </div>

          {/* Filters Bar */}
          {sales.length > 0 && (
            <div style={styles.searchBar} className="glass-panel animate-fade-in">
              <div style={styles.searchInputWrapper}>
                <Search size={18} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search by customer, bill number, or items..."
                  className="input-field"
                  style={{ paddingLeft: '44px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={styles.selectWrapper}>
                <Calendar size={16} style={styles.selectIcon} />
                <select
                  className="input-field"
                  style={{ paddingLeft: '38px', appearance: 'none', backgroundPosition: 'right 12px center' }}
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {dateFilter === 'custom' && (
                <div style={styles.dateInputsWrapper} className="animate-fade-in">
                  <input
                    type="date"
                    className="input-field"
                    style={{ width: '130px', padding: '6px 12px' }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="date"
                    className="input-field"
                    style={{ width: '130px', padding: '6px 12px' }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Table / Grid list */}
          {isLoading ? (
            <div style={styles.loadingBox}>
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Loading sales transaction log...
              </span>
            </div>
          ) : sales.length === 0 ? (
            <div style={styles.emptyContainer} className="glass-panel animate-fade-in">
              <div style={styles.emptyIconBox}>
                <ShoppingBag size={32} style={{ color: 'var(--primary)' }} />
              </div>
              <h3 style={styles.emptyTitle}>No credit sales logged</h3>
              <p style={styles.emptyDesc}>
                You haven't recorded any customer credit sales yet. Tap below to log your first transaction.
              </p>
              <button 
                onClick={() => setIsFormOpen(true)} 
                className="btn btn-primary"
                style={{ marginTop: '16px', padding: '12px 24px' }}
              >
                <Plus size={16} style={{ marginRight: '8px' }} />
                <span>Record Your First Sale</span>
              </button>
            </div>
          ) : filteredSales.length === 0 ? (
            <div style={styles.emptyContainer} className="glass-panel animate-fade-in">
              <div style={styles.emptyIconBox}>
                <Search size={32} style={{ color: 'var(--text-muted)' }} />
              </div>
              <h3 style={styles.emptyTitle}>No matching transactions</h3>
              <p style={styles.emptyDesc}>
                No credit sale records match your search query or date range filters.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setDateFilter('all');
                }} 
                className="btn btn-outline"
                style={{ marginTop: '16px', padding: '10px 20px' }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div style={styles.tableCard} className="glass-panel animate-fade-in">
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thRow}>
                      <th style={styles.th}>Customer</th>
                      <th style={styles.th}>Bill Ref</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Items / Notes</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>Attachment</th>
                      <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
                      <th style={{ ...styles.th, textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} style={styles.tdRow}>
                        {/* Customer Column */}
                        <td style={styles.td}>
                          <div style={styles.customerCell}>
                            {sale.customers?.photo_url ? (
                              <img src={sale.customers.photo_url} alt={sale.customers.name} style={styles.avatar} />
                            ) : (
                              <div style={styles.avatarPlaceholder}>
                                <ShoppingBag size={12} style={{ color: 'var(--primary)' }} />
                              </div>
                            )}
                            <div style={styles.customerCellMeta}>
                              <span style={styles.customerCellName}>{sale.customers?.name || 'Deleted Customer'}</span>
                              <span style={styles.customerCellVillage}>{sale.customers?.village || ''}</span>
                            </div>
                          </div>
                        </td>

                        {/* Bill Number */}
                        <td style={styles.td}>
                          <span style={styles.billNoText}>{sale.sale_number}</span>
                        </td>

                        {/* Date */}
                        <td style={styles.td}>
                          <span style={styles.dateText}>
                            {new Date(sale.sale_date).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </td>

                        {/* Notes */}
                        <td style={styles.td}>
                          <span style={styles.notesText} title={sale.notes || ''}>
                            {sale.notes || <span style={{ color: 'var(--text-muted)' }}>No description</span>}
                          </span>
                        </td>

                        {/* Attachment Link */}
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          {sale.bill_photo_url ? (
                            <button 
                              onClick={() => setActiveBillUrl(sale.bill_photo_url)} 
                              style={styles.attachmentBtn}
                              title="View Invoice Scan"
                            >
                              <FileImage size={18} />
                              <span style={{ fontSize: '0.7rem' }}>View</span>
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                          )}
                        </td>

                        {/* Amount */}
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <span style={styles.amountText}>₹{formatAmount(sale.total_amount)}</span>
                        </td>

                        {/* Delete Actions */}
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <button 
                            onClick={() => handleDeleteSale(sale.id, sale.customer_id, sale.customers?.name || 'Customer', sale.total_amount)} 
                            style={styles.deleteBtn}
                            title="Delete transaction log"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bill Attachment Popup Modal */}
      {activeBillUrl && (
        <div style={styles.lightboxBackdrop} onClick={() => setActiveBillUrl(null)}>
          <div style={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.lightboxClose} onClick={() => setActiveBillUrl(null)}>
              <X size={20} />
            </button>
            <img src={activeBillUrl} alt="Bill Attachment Scan" style={styles.lightboxImage} />
          </div>
        </div>
      )}

      {/* Record Sale Wizard Modal */}
      {isFormOpen && shop?.id && (
        <RecordSaleForm
          shopId={shop.id}
          onClose={() => setIsFormOpen(false)}
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
    alignItems: 'center',
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
    minWidth: '160px',
  } as React.CSSProperties,
  selectIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
    zIndex: 2,
  } as React.CSSProperties,
  dateInputsWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
  // Table Styling
  tableCard: {
    borderRadius: 'var(--radius-sm)',
    padding: '8px',
    border: '1px solid var(--border-color)',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.82rem',
  } as React.CSSProperties,
  thRow: {
    borderBottom: '2px solid var(--border-color)',
  } as React.CSSProperties,
  th: {
    padding: '12px 14px',
    fontWeight: '700',
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  tdRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color var(--transition-fast)',
  } as React.CSSProperties,
  td: {
    padding: '12px 14px',
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
  } as React.CSSProperties,
  customerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as React.CSSProperties,
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
  } as React.CSSProperties,
  avatarPlaceholder: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-color)',
  } as React.CSSProperties,
  customerCellMeta: {
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  customerCellName: {
    fontWeight: '700',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  customerCellVillage: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  } as React.CSSProperties,
  billNoText: {
    fontWeight: '600',
    fontFamily: 'monospace',
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  dateText: {
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  notesText: {
    maxWidth: '240px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'inline-block',
  } as React.CSSProperties,
  amountText: {
    fontWeight: '800',
    color: 'var(--danger)',
  } as React.CSSProperties,
  attachmentBtn: {
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-sm)',
    padding: '4px 8px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  deleteBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '50%',
    transition: 'all var(--transition-fast)',
  } as React.CSSProperties,
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '100px 0',
  } as React.CSSProperties,
  // Empty
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
  // Lightbox Modal for Bill Attachment preview
  lightboxBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  } as React.CSSProperties,
  lightboxContent: {
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '90vh',
    display: 'flex',
    backgroundColor: '#fff',
    borderRadius: 'var(--radius-sm)',
    padding: '8px',
  } as React.CSSProperties,
  lightboxClose: {
    position: 'absolute',
    top: '-32px',
    right: '-8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    padding: '6px',
  } as React.CSSProperties,
  lightboxImage: {
    maxWidth: '100%',
    maxHeight: 'calc(90vh - 16px)',
    objectFit: 'contain',
    borderRadius: 'var(--radius-sm)',
  } as React.CSSProperties,
};
