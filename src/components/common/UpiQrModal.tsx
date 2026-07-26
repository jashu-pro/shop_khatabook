import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAppStore } from '../../stores/useAppStore';
import { QrCode, Download, Edit3, Check, Copy, X, Printer } from 'lucide-react';
import type { Customer } from '../../types';

interface UpiQrModalProps {
  onClose: () => void;
  selectedCustomer?: Customer | null;
  initialAmount?: number;
}

export const UpiQrModal: React.FC<UpiQrModalProps> = ({
  onClose,
  selectedCustomer: defaultCust,
  initialAmount
}) => {
  const { shop, customers, ledgerEntries, updateShop } = useAppStore();

  const [upiId, setUpiId] = useState(shop?.upi_id || 'srilaxmi@ybl');
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [copied, setCopied] = useState(false);

  const [selectedCustId, setSelectedCustId] = useState<string>(defaultCust?.id || '');
  const targetCust = customers.find(c => c.id === selectedCustId);

  const getCustBalance = (cId: string) => {
    const custLedger = ledgerEntries.filter(l => l.customer_id === cId);
    return custLedger.length > 0 ? custLedger[custLedger.length - 1].running_balance : 0;
  };

  const calcAmount = initialAmount !== undefined 
    ? initialAmount 
    : (targetCust ? getCustBalance(targetCust.id) : 0);

  const [customAmount, setCustomAmount] = useState<string>(calcAmount > 0 ? calcAmount.toString() : '');

  const effectiveAmount = parseFloat(customAmount || '0');
  const shopName = shop?.name || 'Sri Laxmi Traders';

  // Construct official UPI Payment Deep Link URI
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(shopName)}` +
    (effectiveAmount > 0 ? `&am=${effectiveAmount.toFixed(2)}&cu=INR` : '&cu=INR') +
    `&tn=${encodeURIComponent(targetCust ? `Khatta Payment for ${targetCust.name}` : 'Shop Payment')}`;

  const handleSaveUpi = () => {
    if (upiId.trim()) {
      updateShop({ upi_id: upiId.trim() });
      setIsEditingUpi(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomerSelect = (cId: string) => {
    setSelectedCustId(cId);
    if (cId) {
      const bal = getCustBalance(cId);
      setCustomAmount(bal > 0 ? bal.toString() : '');
    } else {
      setCustomAmount('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '22px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, var(--khatta-600), var(--khatta-800))',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <QrCode size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Auto-Generated UPI QR Code</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Scan with GPay, PhonePe, Paytm or BHIM</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Interactive Controls */}
        <div style={{ background: 'var(--border-subtle)', borderRadius: 14, padding: 12, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          
          {/* Shop UPI ID Editor */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              SHOP UPI ID / VPA
            </label>
            {isEditingUpi ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  className="input-field"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. srilaxmi@ybl or 9876543210@paytm"
                  style={{ padding: '6px 10px', fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={handleSaveUpi}
                  className="btn-primary"
                  style={{ width: 'auto', padding: '6px 14px', borderRadius: 10, fontSize: '12px' }}
                >
                  <Check size={14} /> Save
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                <span style={{ fontWeight: 800, color: 'var(--khatta-700)', fontSize: '14px', fontFamily: 'monospace' }}>
                  {upiId}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px' }}
                    title="Copy UPI ID"
                  >
                    {copied ? <Check size={14} color="var(--khatta-600)" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingUpi(true)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--khatta-600)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px', fontWeight: 700 }}
                  >
                    <Edit3 size={14} /> Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Customer & Amount Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                SELECT CUSTOMER (OPTIONAL)
              </label>
              <select
                className="input-field"
                value={selectedCustId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                style={{ padding: '6px 8px', fontSize: '12px' }}
              >
                <option value="">-- General Payment --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.village}) - ₹{getCustBalance(c.id)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                AMOUNT (₹)
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="Any amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '12px' }}
              />
            </div>
          </div>

        </div>

        {/* Render Live Vector QR Code Card */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
          border: '2px solid var(--khatta-600)',
          borderRadius: 20,
          padding: 20,
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(5, 150, 105, 0.15)',
          marginBottom: 16
        }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>
            {shopName}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 14 }}>
            {targetCust ? `Khatta Balance Payment for ${targetCust.name}` : 'Accept Payments via All UPI Apps'}
          </div>

          {/* QR Container */}
          <div style={{
            background: 'white',
            padding: 16,
            borderRadius: 16,
            display: 'inline-block',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid var(--border-light)'
          }}>
            <QRCodeSVG
              value={upiUrl}
              size={180}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: 'https://cdn-icons-png.flaticon.com/512/2702/2702602.png',
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true
              }}
            />
          </div>

          {/* Amount Badge */}
          <div style={{ marginTop: 12 }}>
            {effectiveAmount > 0 ? (
              <span style={{
                background: 'var(--khatta-50)',
                color: 'var(--khatta-700)',
                fontSize: '18px',
                fontWeight: 800,
                padding: '4px 16px',
                borderRadius: '9999px',
                border: '1px solid var(--khatta-500)'
              }}>
                Scan to Pay: ₹{effectiveAmount.toLocaleString('en-IN')}
              </span>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Customer enters payment amount on phone
              </span>
            )}
          </div>

          {/* Supported UPI Apps Footer */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 14, fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>
            <span>PhonePe</span> • <span>Google Pay</span> • <span>Paytm</span> • <span>BHIM UPI</span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handlePrint}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Printer size={16} /> Print Poster
          </button>

          <a
            href={`data:text/calendar;charset=utf8,${encodeURIComponent(upiUrl)}`}
            download="UPI_QR_Code.svg"
            className="btn-primary"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              const svgElement = document.querySelector('.modal-sheet svg');
              if (svgElement) {
                const svgData = new XMLSerializer().serializeToString(svgElement);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const svgUrl = URL.createObjectURL(svgBlob);
                const downloadLink = document.createElement('a');
                downloadLink.href = svgUrl;
                downloadLink.download = `UPI_QR_${shopName.replace(/\s+/g, '_')}.svg`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
              }
            }}
          >
            <Download size={16} /> Save QR Image
          </a>
        </div>

      </div>
    </div>
  );
};
