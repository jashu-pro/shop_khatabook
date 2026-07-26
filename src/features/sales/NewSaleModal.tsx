import React, { useState, useRef } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { LiveCameraModal } from '../../components/common/LiveCameraModal';
import { Trash2, Camera, CheckCircle2, ShoppingBag, Image as ImageIcon, X, Upload, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export const NewSaleModal: React.FC<{ onClose: () => void; initialCustomerId?: string }> = ({ onClose, initialCustomerId }) => {
  const { customers, shop, ledgerEntries, addCreditSale } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId || customers[0]?.id || '');
  const [items, setItems] = useState<Array<{ item_name: string; quantity: number; unit_price: number }>>([
    { item_name: 'General Udhaar Goods', quantity: 1, unit_price: 500 }
  ]);
  const [discount, setDiscount] = useState('0');
  const [tax] = useState('0');
  const [amountPaid, setAmountPaid] = useState('0');
  const [notes] = useState('');
  const [billPhotoUrl, setBillPhotoUrl] = useState<string>('');
  const [showLiveCamera, setShowLiveCamera] = useState<boolean>(false);
  const [autoSendWhatsApp, setAutoSendWhatsApp] = useState<boolean>(true);

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const totalAmount = subtotal - parseFloat(discount || '0') + parseFloat(tax || '0');
  const balanceDue = totalAmount - parseFloat(amountPaid || '0');

  const handleAddItem = () => {
    setItems([...items, { item_name: '', quantity: 1, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSamplePhoto = () => {
    setBillPhotoUrl('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=80');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || items.length === 0) return;

    const customer = customers.find(c => c.id === selectedCustomerId);

    // Save credit sale to state store / database
    addCreditSale({
      customer_id: selectedCustomerId,
      items,
      discount: parseFloat(discount || '0'),
      tax: parseFloat(tax || '0'),
      amount_paid: parseFloat(amountPaid || '0'),
      bill_photo_url: billPhotoUrl,
      notes
    });

    // Auto-send WhatsApp receipt to customer's phone number
    if (autoSendWhatsApp && customer?.phone) {
      const cleanPhone = customer.phone.replace(/\D/g, '');
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const shopName = shop?.name || 'Sri Laxmi Traders';

      const custLedger = ledgerEntries.filter(l => l.customer_id === selectedCustomerId);
      const prevBalance = custLedger.length > 0 ? custLedger[custLedger.length - 1].running_balance : 0;
      const newTotalBalance = prevBalance + balanceDue;

      const itemLines = items
        .filter(i => i.item_name)
        .map(i => `• ${i.item_name} (x${i.quantity}) — Rs. ${(i.unit_price * i.quantity).toLocaleString('en-IN')}`)
        .join('\n');

      const whatsappText = 
        `🙏 *${shopName.toUpperCase()}*\n` +
        `*New Bill & Khatta Entry Saved*\n\n` +
        `Hello *${customer.name}*,\n` +
        `A new credit bill of *Rs. ${totalAmount.toLocaleString('en-IN')}* has been added to your Khatta notebook.\n\n` +
        `📋 *Bill Items*:\n${itemLines}\n\n` +
        (parseFloat(amountPaid) > 0 ? `💵 *Cash Paid*: Rs. ${parseFloat(amountPaid).toLocaleString('en-IN')}\n` : '') +
        `🔴 *Udhaar Added*: Rs. ${balanceDue.toLocaleString('en-IN')}\n` +
        `💰 *Total Outstanding Balance*: Rs. ${newTotalBalance.toLocaleString('en-IN')}\n\n` +
        `💳 *Pay via UPI*: upi://pay?pa=${shop?.upi_id || 'srilaxmi@ybl'}&pn=${encodeURIComponent(shopName)}\n\n` +
        `Thank you for your business!`;

      const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappText)}`;
      window.open(waUrl, '_blank');
    }

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--khatta-50)', color: 'var(--khatta-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2>Record Credit Sale</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Generate itemized bill & credit ledger entry</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Customer Selector */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: 4, display: 'block' }}>Select Customer *</label>
            <select
              className="input-field"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.village}) — Phone: {c.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Line Items */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: '12px', fontWeight: 700 }}>Itemized Items List *</label>
              <button type="button" onClick={handleAddItem} style={{ fontSize: '12px', color: 'var(--khatta-600)', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                + Add Line Item
              </button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.2fr 30px', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Item Name / Description"
                  value={item.item_name}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].item_name = e.target.value;
                    setItems(newItems);
                  }}
                  style={{ fontSize: '12px', padding: '8px' }}
                  required
                />

                <input
                  type="number"
                  className="input-field"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].quantity = parseFloat(e.target.value) || 1;
                    setItems(newItems);
                  }}
                  style={{ fontSize: '12px', padding: '8px' }}
                  required
                />

                <input
                  type="number"
                  className="input-field"
                  placeholder="Price ₹"
                  value={item.unit_price}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].unit_price = parseFloat(e.target.value) || 0;
                    setItems(newItems);
                  }}
                  style={{ fontSize: '12px', padding: '8px' }}
                  required
                />

                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  style={{ border: 'none', background: 'none', color: 'var(--debt-600)', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Subtotal and Balance Calculation */}
          <div style={{ background: 'var(--border-subtle)', borderRadius: '12px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span>Subtotal:</span>
              <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600 }}>Discount (₹)</label>
                <input type="number" className="input-field" style={{ padding: '6px 10px' }} value={discount} onChange={(e) => setDiscount(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600 }}>Paid Cash Now (₹)</label>
                <input type="number" className="input-field" style={{ padding: '6px 10px' }} value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, marginTop: 4, paddingTop: 6, borderTop: '1px solid var(--border-light)' }}>
              <span>Balance Owed (Udhaar):</span>
              <span style={{ color: 'var(--debt-600)' }}>₹{balanceDue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            style={{ display: 'none' }}
          />

          {/* Camera Capture & Image Attachment Section */}
          {!billPhotoUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowLiveCamera(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--khatta-600), var(--khatta-700))',
                    color: 'white',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  <Camera size={18} />
                  Open Live Camera
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-light)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={16} />
                  Upload Photo
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  📷 Live camera works on Mobile, Tablet & Laptop webcam
                </span>
                <button
                  type="button"
                  onClick={handleUseSamplePhoto}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6366f1',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <ImageIcon size={13} />
                  Use Sample Photo
                </button>
              </div>
            </div>
          ) : (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '14px',
                border: '1.5px solid var(--khatta-500)',
                background: 'var(--khatta-50)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={billPhotoUrl}
                  alt="Bill / Item Photo Proof"
                  style={{ width: 50, height: 50, borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-light)' }}
                />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--khatta-800)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={15} color="var(--khatta-600)" />
                    Item Photo Proof Attached!
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    Saved as transaction proof in database
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => setShowLiveCamera(true)}
                  style={{
                    padding: '5px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer'
                  }}
                >
                  Retake
                </button>
                <button
                  type="button"
                  onClick={() => setBillPhotoUrl('')}
                  style={{
                    padding: '5px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    background: 'var(--debt-50)',
                    color: 'var(--debt-600)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  title="Remove Photo"
                >
                  <X size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Auto WhatsApp Option Checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12px', fontWeight: 700, color: '#16a34a', cursor: 'pointer', background: '#dcfce7', padding: '10px 14px', borderRadius: '12px' }}>
            <input
              type="checkbox"
              checked={autoSendWhatsApp}
              onChange={(e) => setAutoSendWhatsApp(e.target.checked)}
              style={{ accentColor: '#16a34a', width: 18, height: 18 }}
            />
            <Send size={16} />
            <span>Auto-send bill & Khatta receipt to WhatsApp automatically on Save</span>
          </label>

          <button type="submit" className="btn-primary" style={{ marginTop: 4 }}>
            <CheckCircle2 size={18} />
            Save & Add to Khatta
          </button>
        </form>

        {/* Live Camera Viewfinder Modal */}
        {showLiveCamera && (
          <LiveCameraModal
            onCapture={(imageDataUrl) => {
              setBillPhotoUrl(imageDataUrl);
              setShowLiveCamera(false);
            }}
            onClose={() => setShowLiveCamera(false)}
          />
        )}
      </div>
    </div>
  );
};
