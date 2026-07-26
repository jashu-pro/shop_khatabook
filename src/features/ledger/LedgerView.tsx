import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { Camera, X } from 'lucide-react';

export const LedgerView: React.FC = () => {
  const { ledgerEntries, customers, sales } = useAppStore();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'SALE' | 'PAYMENT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);

  const filteredEntries = ledgerEntries.filter(entry => {
    if (selectedCustomerId !== 'ALL' && entry.customer_id !== selectedCustomerId) return false;
    if (filterType !== 'ALL' && entry.entry_type !== filterType) return false;
    if (searchQuery && !entry.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) && !entry.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const totalJama = filteredEntries.reduce((sum, e) => sum + e.credit, 0);
  const totalUdhaar = filteredEntries.reduce((sum, e) => sum + e.debit, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>Traditional Bahi-Khata Ledger</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Digital Notebook Dual-Column Ledger with Photo Proofs</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div style={{ background: 'var(--khatta-50)', border: '1px solid var(--khatta-100)', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--khatta-700)', fontWeight: 700 }}>Total Jama (Received)</span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--khatta-700)' }}>
            ₹{totalJama.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ background: 'var(--debt-50)', border: '1px solid var(--debt-100)', borderRadius: '14px', padding: '14px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--debt-700)', fontWeight: 700 }}>Total Udhaar (Given)</span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--debt-600)' }}>
            ₹{totalUdhaar.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <input
          type="text"
          className="input-field"
          placeholder="Search ledger entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            className="input-field"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            style={{ fontSize: '12px', padding: '8px 12px', flex: 1 }}
          >
            <option value="ALL">All Customers</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.village})</option>)}
          </select>

          <select
            className="input-field"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            style={{ fontSize: '12px', padding: '8px 12px', flex: 1 }}
          >
            <option value="ALL">All Entries</option>
            <option value="SALE">Udhaar Only (Given)</option>
            <option value="PAYMENT">Jama Only (Received)</option>
          </select>
        </div>
      </div>

      {/* Notebook Table */}
      <div className="notebook-container">
        <div className="notebook-header">
          <span>Customer & Description</span>
          <span style={{ textAlign: 'right' }}>Jama (Green)</span>
          <span style={{ textAlign: 'right' }}>Udhaar (Red)</span>
        </div>

        {filteredEntries.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No transaction records found matching filter.
          </div>
        ) : (
          filteredEntries.slice().reverse().map(entry => {
            const linkedSale = sales.find(s => s.id === entry.sale_id);
            const photoUrl = linkedSale?.bill_photo_url;

            return (
              <div key={entry.id} className="notebook-row">
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {entry.customer_name}
                    {photoUrl && (
                      <button
                        onClick={() => setViewingPhotoUrl(photoUrl)}
                        style={{
                          background: 'var(--khatta-50)',
                          color: 'var(--khatta-700)',
                          border: '1px solid var(--khatta-200)',
                          borderRadius: '6px',
                          padding: '2px 6px',
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3
                        }}
                        title="View Captured Item Photo Proof"
                      >
                        <Camera size={12} /> Photo Proof
                      </button>
                    )}
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{entry.description}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 2 }}>
                    {new Date(entry.entry_date).toLocaleDateString('en-IN')} • {new Date(entry.entry_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="jama-green" style={{ textAlign: 'right', fontSize: '14px' }}>
                  {entry.credit > 0 ? `+ ₹${entry.credit.toLocaleString('en-IN')}` : '-'}
                </div>

                <div className="udhaar-red" style={{ textAlign: 'right', fontSize: '14px' }}>
                  {entry.debit > 0 ? `- ₹${entry.debit.toLocaleString('en-IN')}` : '-'}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Photo Proof Lightbox Modal */}
      {viewingPhotoUrl && (
        <div className="modal-overlay" onClick={() => setViewingPhotoUrl(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Camera size={20} color="var(--khatta-600)" />
                <h3 style={{ fontSize: '16px' }}>Item Photo Proof (Database)</h3>
              </div>
              <button onClick={() => setViewingPhotoUrl(null)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)', marginBottom: 14 }}>
              <img
                src={viewingPhotoUrl}
                alt="Item Photo Proof"
                style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', background: '#000' }}
              />
            </div>

            <button className="btn-primary" onClick={() => setViewingPhotoUrl(null)}>
              <X size={16} /> Close Photo View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
