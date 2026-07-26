import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import type { PaymentMethod } from '../../types';
import { CheckCircle2, ArrowDownLeft, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReceivePaymentModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { customers, shop, ledgerEntries, receivePayment } = useAppStore();
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('UPI_PHONEPE');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes] = useState('');
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState<boolean>(true);

  const custLedger = ledgerEntries.filter(l => l.customer_id === selectedCustomerId);
  const currentBalance = custLedger.length > 0 ? custLedger[custLedger.length - 1].running_balance : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paidAmt = parseFloat(amount);
    if (!selectedCustomerId || !paidAmt || paidAmt <= 0) return;

    const customer = customers.find(c => c.id === selectedCustomerId);

    receivePayment({
      customer_id: selectedCustomerId,
      amount: paidAmt,
      method,
      reference_no: referenceNo || `UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      notes
    });

    // Auto-send WhatsApp payment confirmation receipt
    if (autoSendWhatsApp && customer?.phone) {
      const cleanPhone = customer.phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const shopName = shop?.name || 'Sri Laxmi Traders';
      const remainingBalance = Math.max(0, currentBalance - paidAmt);

      const whatsappText = 
        `🙏 *${shopName.toUpperCase()}*\n` +
        `*Payment Received Receipt*\n\n` +
        `Hello *${customer.name}*,\n` +
        `Thank you! We have received a payment of *Rs. ${paidAmt.toLocaleString('en-IN')}* via ${method.replace('_', ' ')}.\n\n` +
        `🟢 *Payment Received*: Rs. ${paidAmt.toLocaleString('en-IN')}\n` +
        `💰 *Remaining Khatta Balance*: Rs. ${remainingBalance.toLocaleString('en-IN')}\n\n` +
        `Thank you for clearing your bill on time!`;

      const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappText)}`;
      window.open(waUrl, '_blank');
    }

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--amber-50)', color: 'var(--amber-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowDownLeft size={20} />
            </div>
            <div>
              <h2>Receive Customer Payment</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Record Cash, PhonePe, GPay, Paytm or Bank Transfer</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: 4, display: 'block' }}>Select Customer *</label>
            <select
              className="input-field"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
            >
              {customers.map(c => {
                const cLedger = ledgerEntries.filter(l => l.customer_id === c.id);
                const bal = cLedger.length > 0 ? cLedger[cLedger.length - 1].running_balance : 0;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.village}) — Owed: ₹{bal.toLocaleString('en-IN')}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ background: 'var(--debt-50)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--debt-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--debt-700)', fontWeight: 600 }}>Total Current Udhaar Owed:</span>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--debt-600)' }}>
                ₹{currentBalance.toLocaleString('en-IN')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAmount(currentBalance.toString())}
              style={{ background: 'var(--debt-600)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              Pay Full Amount
            </button>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: 4, display: 'block' }}>Amount Received (₹) *</label>
            <input
              type="number"
              className="input-field"
              placeholder="e.g. 1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{ fontSize: '18px', fontWeight: 700 }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: 6, display: 'block' }}>Payment Method *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { id: 'UPI_PHONEPE', label: 'PhonePe' },
                { id: 'UPI_GPAY', label: 'Google Pay' },
                { id: 'UPI_PAYTM', label: 'Paytm' },
                { id: 'CASH', label: 'Cash' },
                { id: 'BANK_TRANSFER', label: 'Bank' },
                { id: 'OTHER', label: 'Other' }
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id as PaymentMethod)}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1.5px solid',
                    borderColor: method === m.id ? 'var(--khatta-600)' : 'var(--border-light)',
                    background: method === m.id ? 'var(--khatta-50)' : 'var(--bg-card)',
                    color: method === m.id ? 'var(--khatta-700)' : 'var(--text-main)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: 4, display: 'block' }}>UPI Reference / UTR No. (Optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. UPI/620491823901"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
            />
          </div>

          {/* Auto WhatsApp Receipt Option */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12px', fontWeight: 700, color: '#16a34a', cursor: 'pointer', background: '#dcfce7', padding: '10px 14px', borderRadius: '12px' }}>
            <input
              type="checkbox"
              checked={autoSendWhatsApp}
              onChange={(e) => setAutoSendWhatsApp(e.target.checked)}
              style={{ accentColor: '#16a34a', width: 18, height: 18 }}
            />
            <Send size={16} />
            <span>Auto-send WhatsApp payment confirmation receipt on Confirm</span>
          </label>

          <button type="submit" className="btn-primary" style={{ marginTop: 4, background: 'linear-gradient(135deg, var(--amber-600), #b45309)' }}>
            <CheckCircle2 size={18} />
            Confirm Payment Received
          </button>
        </form>
      </div>
    </div>
  );
};
