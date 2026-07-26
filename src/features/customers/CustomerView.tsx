import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import type { Customer, CustomerTag } from '../../types';
import { EditCustomerModal } from './EditCustomerModal';
import { UpiQrModal } from '../../components/common/UpiQrModal';
import { downloadSingleCustomerPDF, downloadAllCustomersSummaryPDF } from '../../services/pdfService';
import { 
  Search, Phone, Plus, QrCode,
  MapPin, Send, Trash2, Pencil, Receipt, CreditCard, FileText, ChevronRight, X
} from 'lucide-react';

export const CustomerView: React.FC<{
  onOpenAddCustomer: () => void;
  onOpenNewSale?: (customerId?: string) => void;
  onOpenReceivePayment?: (customerId?: string) => void;
}> = ({ onOpenAddCustomer, onOpenNewSale, onOpenReceivePayment }) => {
  const { customers, sales, ledgerEntries, shop, sendWhatsAppReminder, deleteCustomer, updateCustomer } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [qrCustomer, setQrCustomer] = useState<Customer | null>(null);

  const getCustomerBalance = (customerId: string) => {
    const custLedger = ledgerEntries.filter(l => l.customer_id === customerId);
    return custLedger.length > 0 ? custLedger[custLedger.length - 1].running_balance : 0;
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarTheme = (name: string) => {
    const themes = [
      { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
      { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
      { bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff' },
      { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
      { bg: '#ffe4e6', color: '#9f1239', border: '#fecdd3' }
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return themes[sum % themes.length];
  };

  const getTagBadgeStyle = (tagStr: string) => {
    const tag = tagStr.toUpperCase();
    if (tag.includes('NEW')) return { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' };
    if (tag.includes('VIP')) return { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' };
    if (tag.includes('RISK')) return { bg: '#fef2f2', color: '#b91c1c', dot: '#ef4444' };
    return { bg: '#fffbeb', color: '#b45309', dot: '#f59e0b' };
  };

  const filteredCustomers = customers.filter(c => {
    if (c.is_deleted) return false;
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    
    if (selectedTag === 'ALL') return matchesSearch;
    return matchesSearch && c.tags.includes(selectedTag as any);
  });

  return (
    <div>
      {/* Search, Export & Add Header */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by Name, Village, Mobile..."
            style={{ paddingLeft: 38 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button 
          onClick={() => downloadAllCustomersSummaryPDF(customers, ledgerEntries, shop)}
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-light)',
            padding: '0 14px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
          title={`Export PDF Passbook for All ${customers.length} Customers`}
        >
          <FileText size={16} color="var(--khatta-600)" />
          All Customers PDF ({customers.length})
        </button>

        <button className="btn-primary" onClick={onOpenAddCustomer} style={{ width: 'auto', padding: '0 16px', borderRadius: '12px' }}>
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* Tag Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {['ALL', 'VIP', 'Regular', 'Risk'].map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: '1px solid',
              borderColor: selectedTag === tag ? 'var(--khatta-600)' : 'var(--border-light)',
              background: selectedTag === tag ? 'var(--khatta-600)' : 'var(--bg-card)',
              color: selectedTag === tag ? 'white' : 'var(--text-main)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tag === 'ALL' ? 'All Customers' : tag}
          </button>
        ))}
      </div>

      {/* Clean Mobile Customer Card List (Inspired by Screenshot 2) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredCustomers.map(customer => {
          const balance = getCustomerBalance(customer.id);
          const limitUsage = Math.min(100, Math.round((balance / customer.credit_limit) * 100));
          const avatarTheme = getAvatarTheme(customer.name);
          const primaryTag = customer.tags[0] || 'Regular';
          const badgeStyle = getTagBadgeStyle(primaryTag);
          const createdDateFormatted = new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) + ' · ' + new Date(customer.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={customer.id}
              style={{
                background: 'var(--bg-card)',
                borderRadius: '20px',
                padding: '16px',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              {/* Top Row: Initials Avatar + Name & Village + Status Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {/* Initials Badge or Avatar */}
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '14px',
                    background: avatarTheme.bg,
                    color: avatarTheme.color,
                    border: `1px solid ${avatarTheme.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 800,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                    flexShrink: 0
                  }}>
                    {getInitials(customer.name)}
                  </div>

                  <div>
                    <h3 
                      onClick={() => setSelectedCustomer(customer)}
                      style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', cursor: 'pointer' }}
                    >
                      {customer.name}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <MapPin size={12} color="var(--khatta-600)" />
                      {customer.village}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {/* Status Pill */}
                  <div style={{
                    background: badgeStyle.bg,
                    color: badgeStyle.color,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: badgeStyle.dot }} />
                    {primaryTag.toUpperCase()}
                  </div>

                  {/* Ledger Debt Amount */}
                  <div style={{ fontSize: '17px', fontWeight: 900, color: balance > 0 ? 'var(--debt-600)' : 'var(--khatta-600)' }}>
                    ₹{balance.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Middle Row: Formatted Mobile Number, Timestamp & Quick Action Round Buttons */}
              <div style={{
                background: 'var(--border-subtle)',
                borderRadius: '14px',
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'sans-serif' }}>
                    +91 {customer.phone.replace(/^(\d{5})(\d{5})$/, '$1 $2')}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                    {createdDateFormatted}
                  </div>
                </div>

                {/* Round Icon Action Buttons (Call, WhatsApp, QR, Detail Arrow) */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <a
                    href={`tel:${customer.phone}`}
                    style={{
                      width: 34, height: 34, borderRadius: '10px',
                      background: 'var(--bg-card)', color: 'var(--text-main)',
                      border: '1px solid var(--border-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      textDecoration: 'none'
                    }}
                    title="Call Phone"
                  >
                    <Phone size={15} />
                  </a>

                  <button
                    onClick={() => sendWhatsAppReminder(customer.id)}
                    style={{
                      width: 34, height: 34, borderRadius: '10px',
                      background: '#dcfce7', color: '#16a34a',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="WhatsApp Statement & QR"
                  >
                    <Send size={15} />
                  </button>

                  <button
                    onClick={() => setQrCustomer(customer)}
                    style={{
                      width: 34, height: 34, borderRadius: '10px',
                      background: 'var(--khatta-50)', color: 'var(--khatta-600)',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="UPI QR Code"
                  >
                    <QrCode size={15} />
                  </button>

                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    style={{
                      width: 34, height: 34, borderRadius: '10px',
                      background: 'var(--bg-card)', color: 'var(--text-main)',
                      border: '1px solid var(--border-light)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="View Customer Details & Passbook"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Progress Bar & Primary Action Buttons */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 700, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Limit usage: {limitUsage}%</span>
                  <span style={{ color: 'var(--text-muted)' }}>Max Limit: ₹{customer.credit_limit.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ background: 'var(--border-subtle)', borderRadius: '9999px', height: 6, overflow: 'hidden', marginBottom: 10 }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${limitUsage}%`,
                      background: limitUsage > 80 ? 'var(--debt-600)' : 'var(--khatta-500)',
                      borderRadius: '9999px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => onOpenNewSale?.(customer.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '12px',
                      background: '#6366f1',
                      color: 'white',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer'
                    }}
                  >
                    <Receipt size={15} />
                    New Bill (Debit)
                  </button>

                  <button
                    onClick={() => onOpenReceivePayment?.(customer.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '12px',
                      background: '#059669',
                      color: 'white',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer'
                    }}
                  >
                    <CreditCard size={15} />
                    Collect Payment
                  </button>

                  <button
                    onClick={() => setEditingCustomer(customer)}
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      background: 'var(--bg-card-hover)',
                      border: '1px solid var(--border-light)',
                      color: 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                    title="Edit Customer Details"
                  >
                    <Pencil size={15} />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete customer ${customer.name}?`)) {
                        deleteCustomer(customer.id);
                      }
                    }}
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      background: 'var(--bg-card-hover)',
                      border: '1px solid var(--border-light)',
                      color: 'var(--debt-600)',
                      cursor: 'pointer'
                    }}
                    title="Delete Customer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Customer Details & Bahi Ledger Drawer Modal (Inspired by Screenshot 3) */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '22px' }}>
            
            {/* Top Close Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '16px',
                  background: getAvatarTheme(selectedCustomer.name).bg,
                  color: getAvatarTheme(selectedCustomer.name).color,
                  border: `1.5px solid ${getAvatarTheme(selectedCustomer.name).border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: 900
                }}>
                  {getInitials(selectedCustomer.name)}
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{selectedCustomer.name}</h2>
                  <div style={{ marginTop: 4 }}>
                    <select
                      value={selectedCustomer.tags[0] || 'Regular'}
                      onChange={(e) => updateCustomer(selectedCustomer.id, { tags: [e.target.value as CustomerTag] })}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 800,
                        border: '1px solid var(--border-light)',
                        background: getTagBadgeStyle(selectedCustomer.tags[0] || 'Regular').bg,
                        color: getTagBadgeStyle(selectedCustomer.tags[0] || 'Regular').color,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Regular">• REGULAR</option>
                      <option value="VIP">• VIP CUSTOMER</option>
                      <option value="Risk">• HIGH RISK</option>
                      <option value="New">• NEW</option>
                    </select>
                  </div>
                </div>
              </div>

              <button onClick={() => setSelectedCustomer(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={22} />
              </button>
            </div>

            {/* Quick Dual Call & WhatsApp Buttons (Screenshot 3 style) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <a
                href={`tel:${selectedCustomer.phone}`}
                style={{
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-main)',
                  fontWeight: 800,
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Phone size={17} /> Call
              </a>

              <button
                type="button"
                onClick={() => sendWhatsAppReminder(selectedCustomer.id)}
                style={{
                  padding: '12px',
                  borderRadius: '14px',
                  background: '#dcfce7',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Send size={17} /> WhatsApp
              </button>
            </div>

            {/* Details Box Card (Screenshot 3 style) */}
            <div style={{
              background: 'var(--border-subtle)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 10
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.8px' }}>
                CUSTOMER DETAILS
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Customer Name</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedCustomer.name}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Village / Location</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedCustomer.village}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phone Number</span>
                <strong style={{ color: 'var(--text-main)' }}>+91 {selectedCustomer.phone}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Khatta Balance</span>
                <strong style={{ color: getCustomerBalance(selectedCustomer.id) > 0 ? 'var(--debt-600)' : 'var(--khatta-600)', fontSize: '15px' }}>
                  ₹{getCustomerBalance(selectedCustomer.id).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            {/* Bahi Ledger Passbook Notebook Container */}
            <div className="notebook-container" style={{ maxHeight: '220px', overflowY: 'auto' }}>
              <div className="notebook-header">
                <span>Date & Details</span>
                <span>Jama (Paid)</span>
                <span>Udhaar (Owed)</span>
              </div>

              {ledgerEntries.filter(l => l.customer_id === selectedCustomer.id).map(entry => {
                const linkedSale = sales.find(s => s.id === entry.sale_id);
                const photoUrl = linkedSale?.bill_photo_url;

                return (
                  <div key={entry.id} className="notebook-row">
                    <div>
                      <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {entry.description}
                        {photoUrl && (
                          <span 
                            style={{
                              fontSize: '10px',
                              background: '#dcfce7',
                              color: '#16a34a',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: 700
                            }}
                          >
                            📷 Photo Proof Saved
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {new Date(entry.entry_date).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div className="jama-green">
                      {entry.credit > 0 ? `₹${entry.credit}` : '-'}
                    </div>
                    <div className="udhaar-red">
                      {entry.debit > 0 ? `₹${entry.debit}` : '-'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button 
                className="btn-primary" 
                onClick={() => {
                  const custId = selectedCustomer.id;
                  setSelectedCustomer(null);
                  onOpenNewSale?.(custId);
                }}
              >
                <Receipt size={16} />
                New Bill (Debit)
              </button>

              <button 
                className="btn-secondary" 
                onClick={() => downloadSingleCustomerPDF(selectedCustomer, ledgerEntries, shop)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700 }}
              >
                <FileText size={16} color="var(--khatta-600)" />
                Download PDF
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Edit Customer Details Modal */}
      {editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
        />
      )}

      {/* Dynamic UPI QR Modal */}
      {qrCustomer && (
        <UpiQrModal
          selectedCustomer={qrCustomer}
          onClose={() => setQrCustomer(null)}
        />
      )}
    </div>
  );
};
