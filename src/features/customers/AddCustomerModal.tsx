import React, { useState, useRef } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import type { CustomerTag, Customer } from '../../types';
import { LiveCameraModal } from '../../components/common/LiveCameraModal';
import { UserPlus, CheckCircle2, ShieldAlert, Camera, Upload, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AddCustomerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addCustomer } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [address] = useState('');
  const [creditLimit, setCreditLimit] = useState('50000');
  const [tag, setTag] = useState<CustomerTag>('Regular');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [openingBalanceType, setOpeningBalanceType] = useState<'DEBIT' | 'CREDIT'>('DEBIT');

  const [duplicateFound, setDuplicateFound] = useState<Customer | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !village) return;

    const openingAmt = parseFloat(openingBalance || '0');
    const result = addCustomer(
      {
        shop_id: 'shop-1',
        name,
        phone,
        village,
        address,
        notes,
        photo_url: photoUrl,
        tags: [tag],
        credit_limit: parseFloat(creditLimit || '50000')
      },
      openingAmt > 0 ? { amount: openingAmt, type: openingBalanceType } : undefined
    );

    if (!result.success && result.duplicate) {
      setDuplicateFound(result.duplicate);
      return;
    }

    confetti({ particleCount: 40, spread: 60 });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--khatta-50)', color: 'var(--khatta-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={20} />
            </div>
            <div>
              <h2>Add New Customer</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Create digital customer file with photo avatar</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Duplicate Customer Warning Banner Modal */}
        {duplicateFound ? (
          <div style={{ background: 'var(--debt-50)', border: '1.5px solid var(--debt-500)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--debt-700)', fontWeight: 800, fontSize: '15px', marginBottom: 8 }}>
              <ShieldAlert size={22} />
              Duplicate Customer Detected!
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--debt-800)', lineHeight: 1.4, marginBottom: 12 }}>
              A customer named <strong>{duplicateFound.name}</strong> from <strong>{duplicateFound.village}</strong> with phone <strong>{duplicateFound.phone}</strong> already exists in your Khatta notebook!
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" onClick={() => setDuplicateFound(null)}>
                Edit Details
              </button>
              <button className="btn-primary" onClick={onClose} style={{ background: 'var(--debt-600)' }}>
                View Existing Customer
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="user"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            {/* Profile Photo Camera & Upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--border-subtle)', padding: 12, borderRadius: 16 }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                  alt={name || 'Customer Profile'}
                  style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--khatta-600)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                  }}
                />
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'var(--debt-600)',
                      color: 'white',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    title="Remove Photo"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>Customer Profile Photo</span>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowLiveCamera(true)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 10px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, var(--khatta-600), var(--khatta-700))',
                      color: 'white',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    <Camera size={15} />
                    Take Photo
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 10px',
                      borderRadius: '10px',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-light)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Upload size={15} />
                    Upload
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700 }}>Customer Full Name *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Venkatesh Rao"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Mobile Phone Number *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="9440112345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Village / Town *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Tadipatri"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Credit Limit (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="50000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Customer Tag</label>
                <select className="input-field" value={tag} onChange={(e) => setTag(e.target.value as CustomerTag)}>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP Customer</option>
                  <option value="Risk">High Risk</option>
                </select>
              </div>
            </div>

            {/* Opening Balance (Initial Debt / Credit) */}
            <div style={{ background: 'var(--border-subtle)', padding: 12, borderRadius: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>Opening Balance (Optional Initial Record)</label>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Previous Khatta Balance</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 10 }}>
                <input
                  type="number"
                  className="input-field"
                  placeholder="₹0 (e.g. 1500)"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                />
                <select
                  className="input-field"
                  value={openingBalanceType}
                  onChange={(e) => setOpeningBalanceType(e.target.value as 'DEBIT' | 'CREDIT')}
                >
                  <option value="DEBIT">Customer Owes Me (Udhaar)</option>
                  <option value="CREDIT">I Owe Customer (Jama/Advance)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700 }}>Notes / Address (Optional)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Saree shop owner, near Bus Stand"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>
              <CheckCircle2 size={18} />
              Save Customer & Enable Khatta
            </button>
          </form>
        )}

        {/* Live Camera Viewfinder Modal */}
        {showLiveCamera && (
          <LiveCameraModal
            onCapture={(imageDataUrl) => {
              setPhotoUrl(imageDataUrl);
              setShowLiveCamera(false);
            }}
            onClose={() => setShowLiveCamera(false)}
          />
        )}
      </div>
    </div>
  );
};
