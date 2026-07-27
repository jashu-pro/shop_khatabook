import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { Printer, ShieldCheck } from 'lucide-react';

export const UpiQrPosterModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { shop } = useAppStore();

  const upiId = shop?.upi_id || 'srilaxmi@ybl';
  const shopName = shop?.name || 'Sri Laxmi Traders';
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&cu=INR`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(upiUri)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '0', overflow: 'hidden' }}>
        {/* Printable Poster Container */}
        <div id="printable-upi-poster" style={{
          background: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
          padding: '24px',
          color: 'white',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={20} color="#a7f3d0" />
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: '#a7f3d0' }}>
                ACCEPTED HERE • ZERO FEE
              </span>
            </div>
            <button onClick={onClose} className="no-print" style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer' }}>✕</button>
          </div>

          {/* Shop Title Banner */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '16px',
            borderRadius: '16px',
            backdropFilter: 'blur(8px)',
            marginBottom: 20,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 800, margin: 0 }}>{shopName.toUpperCase()}</h2>
            <p style={{ fontSize: '12px', opacity: 0.9, marginTop: 4, margin: 0 }}>
              {shop?.village_town}, {shop?.district} • {shop?.category}
            </p>
          </div>

          {/* Official QR Code Card */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            color: '#0f172a',
            margin: '0 auto 20px auto',
            maxWidth: '300px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#059669', marginBottom: 12 }}>
              SCAN & PAY WITH ANY UPI APP
            </div>

            <img
              src={qrImageUrl}
              alt="Shop UPI QR Code"
              style={{ width: '220px', height: '220px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
            />

            <div style={{ marginTop: 12, padding: '8px 12px', background: '#f8fafc', borderRadius: '10px', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
              💳 UPI ID: <span style={{ color: '#059669' }}>{upiId}</span>
            </div>
          </div>

          {/* Accepted App Badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            fontSize: '11px',
            fontWeight: 800,
            color: 'white',
            background: 'rgba(0,0,0,0.15)',
            padding: '10px',
            borderRadius: '12px',
            marginBottom: 20
          }}>
            <span>📲 PhonePe</span>
            <span>•</span>
            <span>🔵 Google Pay</span>
            <span>•</span>
            <span>🟦 Paytm</span>
            <span>•</span>
            <span>🇮🇳 BHIM</span>
          </div>

          {/* Action Bar (Hidden on print) */}
          <div className="no-print" style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              style={{
                flex: 1,
                background: 'white',
                color: '#047857',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Printer size={16} />
              <span>Print QR Standee</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
