import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { UpiQrModal } from '../../components/common/UpiQrModal';
import { 
  TrendingUp, Users, ArrowUpRight, ArrowDownLeft, 
  PlusCircle, CreditCard, UserPlus, BookOpen, QrCode, Sparkles 
} from 'lucide-react';

export const DashboardView: React.FC<{
  onOpenNewSale: () => void;
  onOpenReceivePayment: () => void;
  onOpenAddCustomer: () => void;
}> = ({ onOpenNewSale, onOpenReceivePayment, onOpenAddCustomer }) => {
  const { customers, sales, payments, ledgerEntries, shop, setActiveTab } = useAppStore();
  const [showUpiQrModal, setShowUpiQrModal] = useState(false);

  const totalOutstanding = customers.reduce((sum, c) => {
    const custLedger = ledgerEntries.filter(l => l.customer_id === c.id);
    const bal = custLedger.length > 0 ? custLedger[custLedger.length - 1].running_balance : 0;
    return sum + bal;
  }, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = sales
    .filter(s => s.created_at.startsWith(todayStr))
    .reduce((sum, s) => sum + s.total_amount, 0);

  const todayCollections = payments
    .filter(p => p.created_at.startsWith(todayStr))
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      {/* Welcome Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, var(--khatta-700), var(--khatta-800))',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
          color: 'white',
          marginBottom: '16px',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700 }}>
              Shop Owner Dashboard
            </span>
            <h2 style={{ fontSize: '20px', marginTop: '6px', color: 'white' }}>Namaste, {shop?.name}</h2>
            <p style={{ fontSize: '12px', opacity: 0.9, marginTop: '2px' }}>
              UPI ID: <strong style={{ color: '#fef3c7' }}>{shop?.upi_id}</strong>
            </p>
          </div>
          <button
            onClick={() => setShowUpiQrModal(true)}
            style={{
              background: 'white',
              color: 'var(--khatta-800)',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 14px',
              fontWeight: 800,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}
          >
            <QrCode size={16} />
            UPI QR
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="metrics-grid">
        <div className="metric-card wide">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: 600 }}>Total Customer Debt (Udhaar)</span>
            <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: '9999px' }}>
              {customers.length} Customers
            </span>
          </div>
          <div className="metric-value" style={{ fontSize: '28px', marginTop: '6px' }}>
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.85 }}>
            Total pending collections across all villages
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon icon-green">
            <TrendingUp size={20} />
          </div>
          <div className="metric-value">₹{todaySales.toLocaleString('en-IN')}</div>
          <div className="metric-label">Today's Credit Sales</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon icon-amber">
            <ArrowDownLeft size={20} />
          </div>
          <div className="metric-value">₹{todayCollections.toLocaleString('en-IN')}</div>
          <div className="metric-label">Today's Collections</div>
        </div>

        <div className="metric-card" onClick={() => setActiveTab('customers')} style={{ cursor: 'pointer' }}>
          <div className="metric-icon icon-green">
            <Users size={20} />
          </div>
          <div className="metric-value">{customers.length}</div>
          <div className="metric-label">Active Customers</div>
        </div>

        <div className="metric-card" onClick={() => setActiveTab('reports')} style={{ cursor: 'pointer' }}>
          <div className="metric-icon icon-amber">
            <ArrowUpRight size={20} />
          </div>
          <div className="metric-value">{sales.length + payments.length}</div>
          <div className="metric-label">Total Transactions</div>
        </div>
      </div>

      {/* Quick Action Scroll Bar */}
      <h3 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-muted)' }}>Quick Actions</h3>
      <div className="quick-actions">
        <button className="action-btn" onClick={onOpenNewSale} style={{ background: 'var(--khatta-50)', color: 'var(--khatta-700)', borderColor: 'var(--khatta-200)' }}>
          <PlusCircle size={16} />
          + New Credit Sale
        </button>
        <button className="action-btn" onClick={onOpenReceivePayment} style={{ background: 'var(--amber-50)', color: 'var(--amber-700)', borderColor: 'var(--amber-100)' }}>
          <CreditCard size={16} />
          Receive Payment
        </button>
        <button className="action-btn" onClick={onOpenAddCustomer}>
          <UserPlus size={16} />
          Add Customer
        </button>
        <button className="action-btn" onClick={() => setActiveTab('ledger')}>
          <BookOpen size={16} />
          Open Ledger
        </button>
        <button className="action-btn" onClick={() => setActiveTab('ai')} style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', border: 'none' }}>
          <Sparkles size={16} />
          AI Voice Entry
        </button>
      </div>

      {/* Recent Activity Feed */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-light)', marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px' }}>Recent Activity Stream</h3>
          <button onClick={() => setActiveTab('ledger')} style={{ color: 'var(--khatta-600)', background: 'none', border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
            View Full Ledger →
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ledgerEntries.slice(-4).reverse().map((entry) => (
            <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', background: 'var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '10px',
                  background: entry.entry_type === 'SALE' ? 'var(--debt-50)' : 'var(--khatta-50)',
                  color: entry.entry_type === 'SALE' ? 'var(--debt-600)' : 'var(--khatta-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {entry.entry_type === 'SALE' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{entry.customer_name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{entry.description}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '14px', color: entry.entry_type === 'SALE' ? 'var(--debt-600)' : 'var(--khatta-600)' }}>
                  {entry.entry_type === 'SALE' ? `+ ₹${entry.debit}` : `- ₹${entry.credit}`}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showUpiQrModal && <UpiQrModal onClose={() => setShowUpiQrModal(false)} />}
    </div>
  );
};
