import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import type { Customer, CustomerTag } from '../../types';
import { EditCustomerModal } from './EditCustomerModal';
import { UpiQrModal } from '../../components/common/UpiQrModal';
import { downloadSingleCustomerPDF, downloadAllCustomersSummaryPDF } from '../../services/pdfService';
import { 
  Search, Phone, Plus, QrCode, Send, Pencil, 
  Receipt, CreditCard, FileText, ChevronRight, X
} from 'lucide-react';

export const CustomerView: React.FC<{
  onOpenAddCustomer: () => void;
  onOpenNewSale?: (customerId?: string) => void;
  onOpenReceivePayment?: (customerId?: string) => void;
}> = ({ onOpenAddCustomer, onOpenNewSale, onOpenReceivePayment }) => {
  const { customers, sales, ledgerEntries, shop, sendWhatsAppReminder, updateCustomer } = useAppStore();
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
      {/* Search Bar & Export Buttons Header */}
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
        {['ALL', 'VIP', 'Regular', 'Risk', 'New'].map(tag => (
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

      {/* Mobile Customer Cards List (Exact Screenshot 2 Design) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredCustomers.map(customer => {
          const balance = getCustomerBalance(customer.id);
          const avatarTheme = getAvatarTheme(customer.name);
          const primaryTag = customer.tags[0] || 'Regular';
          const badgeStyle = getTagBadgeStyle(primaryTag);
          const createdDateFormatted = new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) + ' · ' + new Date(customer.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              style={{
                background: 'var(--bg-card)',
                borderRadius: '20px',
                padding: '18px 20px',
                border: '1px solid var(--border-light)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Top Row: Initials Avatar + Name/Subtitle + Status Tag */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 46,
                    height: 46,
                    borderRadius: '14px',
                    background: avatarTheme.bg,
                    color: avatarTheme.color,
                    border: `1px solid ${avatarTheme.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 800,
                    flexShrink: 0
                  }}>
                    {getInitials(customer.name)}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', margin: 0, lineHeight: 1.2 }}>
                      {customer.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      {customer.village || 'Local Residence'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div style={{
                    background: badgeStyle.bg,
                    color: badgeStyle.color,
                    padding: '3px 12px',
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

                  <div style={{ fontSize: '16px', fontWeight: 900, color: balance > 0 ? 'var(--debt-600)' : 'var(--khatta-600)' }}>
                    ₹{balance.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Horizontal Divider Line */}
              <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

              {/* Bottom Row: Phone Number, Date & Quick Outline Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'sans-serif' }}>
                    +91 {customer.phone.replace(/^(\d{5})(\d{5})$/, '$1 $2')}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>
                    {createdDateFormatted}
                  </div>
                </div>

                {/* 3 Outline Icon Action Buttons (Call, WhatsApp, Chevron >) */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`tel:${customer.phone}`}
                    style={{
                      width: 38, height: 38, borderRadius: '12px',
                      background: 'var(--bg-card)', color: 'var(--text-main)',
                      border: '1.5px solid var(--border-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      textDecoration: 'none'
                    }}
                    title="Call Phone"
                  >
                    <Phone size={17} />
                  </a>

                  <button
                    type="button"
                    onClick={() => sendWhatsAppReminder(customer.id)}
                    style={{
                      width: 38, height: 38, borderRadius: '12px',
                      background: 'var(--bg-card)', color: 'var(--text-main)',
                      border: '1.5px solid var(--border-light)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="WhatsApp Statement & QR"
                  >
                    <Send size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(customer)}
                    style={{
                      width: 38, height: 38, borderRadius: '12px',
                      background: 'var(--bg-card)', color: 'var(--text-main)',
                      border: '1.5px solid var(--border-light)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="Open Full Customer Profile Details"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Comprehensive Customer Profile Drawer Modal (Exact Screenshot 3 Design) */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '24px' }}>
            
            {/* Top Close & Initials Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '16px',
                  background: getAvatarTheme(selectedCustomer.name).bg,
                  color: getAvatarTheme(selectedCustomer.name).color,
                  border: `1.5px solid ${getAvatarTheme(selectedCustomer.name).border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', fontWeight: 900
                }}>
                  {getInitials(selectedCustomer.name)}
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{selectedCustomer.name}</h2>
                  <div style={{ marginTop: 4 }}>
                    <select
                      value={selectedCustomer.tags[0] || 'Regular'}
                      onChange={(e) => updateCustomer(selectedCustomer.id, { tags: [e.target.value as CustomerTag] })}
                      style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 800,
                        border: '1px solid var(--border-light)',
                        background: getTagBadgeStyle(selectedCustomer.tags[0] || 'Regular').bg,
                        color: getTagBadgeStyle(selectedCustomer.tags[0] || 'Regular').color,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="New">• NEW</option>
                      <option value="Regular">• REGULAR</option>
                      <option value="VIP">• VIP CUSTOMER</option>
                      <option value="Risk">• HIGH RISK</option>
                    </select>
                  </div>
                </div>
              </div>

              <button onClick={() => setSelectedCustomer(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>

            {/* Quick Dual Call & WhatsApp Buttons (Exact Screenshot 3 style) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <a
                href={`tel:${selectedCustomer.phone}`}
                style={{
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-light)',
                  color: 'var(--text-main)',
                  fontWeight: 800,
                  fontSize: '14px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Phone size={18} /> Call
              </a>

              <button
                type="button"
                onClick={() => sendWhatsAppReminder(selectedCustomer.id)}
                style={{
                  padding: '14px',
                  borderRadius: '16px',
                  background: '#dcfce7',
                  border: '1.5px solid #bbf7d0',
                  color: '#15803d',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Send size={18} /> WhatsApp
              </button>
            </div>

            {/* DETAILS Box (Exact Screenshot 3 style with EVERY detail) */}
            <div style={{
              background: 'var(--border-subtle)',
              borderRadius: '18px',
              padding: '18px',
              marginBottom: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '1px' }}>
                DETAILS
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Owner / Customer Name</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedCustomer.name}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Village / Residence</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedCustomer.village}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phone Number</span>
                <strong style={{ color: 'var(--text-main)' }}>+91 {selectedCustomer.phone}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Credit Limit</span>
                <strong style={{ color: 'var(--text-main)' }}>₹{selectedCustomer.credit_limit.toLocaleString('en-IN')}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Credit Risk Score</span>
                <strong style={{ color: '#16a34a' }}>{selectedCustomer.credit_score || 750} / 850 (Low Risk)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Khatta Balance</span>
                <strong style={{ color: getCustomerBalance(selectedCustomer.id) > 0 ? 'var(--debt-600)' : 'var(--khatta-600)', fontSize: '16px' }}>
                  ₹{getCustomerBalance(selectedCustomer.id).toLocaleString('en-IN')}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Account Created Date</span>
                <strong style={{ color: 'var(--text-main)' }}>{new Date(selectedCustomer.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</strong>
              </div>
            </div>

            {/* Bahi Ledger Passbook Notebook Container */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>BAHI LEDGER NOTEBOOK</span>
                <span>{ledgerEntries.filter(l => l.customer_id === selectedCustomer.id).length} Entries</span>
              </div>

              <div className="notebook-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
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
                              📷 Photo Proof
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
            </div>

            {/* Action Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
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
                onClick={() => {
                  const custId = selectedCustomer.id;
                  setSelectedCustomer(null);
                  onOpenReceivePayment?.(custId);
                }}
                style={{ background: '#059669', color: 'white', border: 'none' }}
              >
                <CreditCard size={16} />
                Collect Payment
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <button 
                className="btn-secondary" 
                onClick={() => setQrCustomer(selectedCustomer)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700, fontSize: '11px', padding: '8px' }}
              >
                <QrCode size={14} color="var(--khatta-600)" />
                UPI QR Code
              </button>

              <button 
                className="btn-secondary" 
                onClick={() => downloadSingleCustomerPDF(selectedCustomer, ledgerEntries, shop)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700, fontSize: '11px', padding: '8px' }}
              >
                <FileText size={14} color="var(--khatta-600)" />
                PDF Passbook
              </button>

              <button 
                className="btn-secondary" 
                onClick={() => {
                  const cust = selectedCustomer;
                  setSelectedCustomer(null);
                  setEditingCustomer(cust);
                }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700, fontSize: '11px', padding: '8px' }}
              >
                <Pencil size={14} />
                Edit Info
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
