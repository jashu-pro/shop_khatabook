import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import type { Customer } from '../../types';
import { EditCustomerModal } from './EditCustomerModal';
import { downloadSingleCustomerPDF, downloadAllCustomersSummaryPDF } from '../../services/pdfService';
import { 
  Search, Phone, MessageSquare, Plus, 
  MapPin, BookOpen, Send, Trash2, Pencil, Receipt, CreditCard, FileText
} from 'lucide-react';

export const CustomerView: React.FC<{
  onOpenAddCustomer: () => void;
  onOpenNewSale?: () => void;
  onOpenReceivePayment?: () => void;
}> = ({ onOpenAddCustomer, onOpenNewSale, onOpenReceivePayment }) => {
  const { customers, sales, ledgerEntries, shop, sendWhatsAppReminder, deleteCustomer } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const getCustomerBalance = (customerId: string) => {
    const custLedger = ledgerEntries.filter(l => l.customer_id === customerId);
    return custLedger.length > 0 ? custLedger[custLedger.length - 1].running_balance : 0;
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
      {/* Search, Add, and PDF Export Header */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by Name, Village, Phone..."
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
          title={`Export PDF for All ${customers.length} Customers`}
        >
          <FileText size={16} color="var(--khatta-600)" />
          All Customers PDF ({customers.length})
        </button>

        <button className="btn-primary" onClick={onOpenAddCustomer} style={{ width: 'auto', padding: '0 16px', borderRadius: '12px' }}>
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* Filter Tag Pills */}
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

      {/* Customer Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredCustomers.map(customer => {
          const balance = getCustomerBalance(customer.id);
          const limitUsage = Math.min(100, Math.round((balance / customer.credit_limit) * 100));
          const avatarUrl = customer.photo_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

          return (
            <div
              key={customer.id}
              style={{
                background: 'var(--bg-card)',
                borderRadius: '24px',
                padding: '20px',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}
            >
              {/* Header: Avatar, Name, Edit Button, Village & Balance */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <img
                    src={avatarUrl}
                    alt={customer.name}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2.5px solid var(--khatta-500)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                    }}
                  />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{customer.name}</h3>
                      <button
                        onClick={() => setEditingCustomer(customer)}
                        style={{
                          background: 'var(--bg-card-hover)',
                          border: '1px solid var(--border-light)',
                          color: 'var(--text-muted)',
                          borderRadius: '8px',
                          padding: '4px 6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Edit Customer Info"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} style={{ color: 'var(--khatta-600)' }} />
                      {customer.village}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.8px', display: 'block' }}>
                    LEDGER DEBT
                  </span>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: balance > 0 ? 'var(--debt-600)' : 'var(--khatta-600)' }}>
                    ₹{balance.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Mobile Number Box with Quick Action Buttons */}
              <div 
                style={{
                  background: 'var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.8px', display: 'block' }}>
                    MOBILE NUMBER
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {customer.phone}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <a
                    href={`tel:${customer.phone}`}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '12px',
                      background: '#e0f2fe',
                      color: '#0284c7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none'
                    }}
                    title="Call Phone"
                  >
                    <Phone size={18} />
                  </a>

                  <a
                    href={`sms:${customer.phone}`}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '12px',
                      background: '#e0e7ff',
                      color: '#4f46e5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none'
                    }}
                    title="Send SMS"
                  >
                    <MessageSquare size={18} />
                  </a>

                  <button
                    onClick={() => sendWhatsAppReminder(customer.id)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '12px',
                      background: '#dcfce7',
                      color: '#16a34a',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Send WhatsApp Message / Khatta Statement"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>

              {/* Credit Limit Usage Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-main)' }}>Limit usage: {limitUsage}%</span>
                  <span style={{ color: 'var(--text-muted)' }}>Max: ₹{customer.credit_limit.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ background: 'var(--border-subtle)', borderRadius: '9999px', height: 8, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${limitUsage}%`,
                      background: limitUsage > 80 ? 'var(--debt-600)' : 'var(--khatta-500)',
                      borderRadius: '9999px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    style={{
                      flex: 1.4,
                      padding: '12px',
                      borderRadius: '14px',
                      border: '1.5px solid var(--text-main)',
                      background: 'transparent',
                      color: 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <BookOpen size={16} />
                    View Bahi Ledger Book
                  </button>

                  <button
                    onClick={() => downloadSingleCustomerPDF(customer, ledgerEntries, shop)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '14px',
                      background: 'var(--bg-card-hover)',
                      border: '1px solid var(--border-light)',
                      color: 'var(--text-main)',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                    title="Download PDF Passbook Statement"
                  >
                    <FileText size={15} color="var(--khatta-600)" />
                    Download PDF
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={onOpenNewSale}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '14px',
                      background: '#6366f1',
                      color: 'white',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    <Receipt size={16} />
                    New Bill (Debit)
                  </button>

                  <button
                    onClick={onOpenReceivePayment}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '14px',
                      background: '#059669',
                      color: 'white',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    <CreditCard size={16} />
                    Collect Payment
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete customer ${customer.name}?`)) {
                        deleteCustomer(customer.id);
                      }
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '14px',
                      background: 'var(--bg-card-hover)',
                      border: '1px solid var(--border-light)',
                      color: 'var(--debt-600)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Delete Customer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Bahi Ledger Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2>{selectedCustomer.name}'s Khatta Notebook</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedCustomer.village} • {selectedCustomer.phone}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="notebook-container">
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

            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button className="btn-primary" onClick={() => sendWhatsAppReminder(selectedCustomer.id)}>
                <Send size={16} />
                WhatsApp Statement
              </button>

              <button 
                className="btn-secondary" 
                onClick={() => downloadSingleCustomerPDF(selectedCustomer, ledgerEntries, shop)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700 }}
              >
                <FileText size={16} color="var(--khatta-600)" />
                Download PDF Statement
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
    </div>
  );
};
