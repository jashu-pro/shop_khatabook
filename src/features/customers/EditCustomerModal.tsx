import React, { useState, useRef } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import type { Customer, CustomerTag } from '../../types';
import { LiveCameraModal } from '../../components/common/LiveCameraModal';
import { Pencil, CheckCircle2, Camera, Upload, Trash2 } from 'lucide-react';

export const EditCustomerModal: React.FC<{
  customer: Customer;
  onClose: () => void;
}> = ({ customer, onClose }) => {
  const { updateCustomer } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [village, setVillage] = useState(customer.village);
  const [creditLimit, setCreditLimit] = useState(customer.credit_limit.toString());
  const [photoUrl, setPhotoUrl] = useState(customer.photo_url || '');
  const [notes, setNotes] = useState(customer.notes || '');
  const [tags, setTags] = useState<CustomerTag[]>(customer.tags || ['Regular']);
  const [showLiveCamera, setShowLiveCamera] = useState(false);

  const availableTags: CustomerTag[] = ['VIP', 'Regular', 'Risk', 'Blocked', 'New'];

  const toggleTag = (tag: CustomerTag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

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
    if (!name || !phone) return;

    updateCustomer(customer.id, {
      name,
      phone,
      village,
      credit_limit: parseFloat(creditLimit || '10000'),
      photo_url: photoUrl,
      notes,
      tags
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'var(--khatta-50)', color: 'var(--khatta-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pencil size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px' }}>Edit Customer Details</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Update profile photo, credit limits, and contact info</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="user"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {/* Profile Picture Camera & Upload Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--border-subtle)', padding: 14, borderRadius: 16 }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                alt={name}
                style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--khatta-600)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
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

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-main)' }}>Customer Profile Picture</span>
              
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
                    padding: '8px 12px',
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
                  Take Live Photo
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
                    padding: '8px 12px',
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
                  Upload Photo
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: 4, display: 'block' }}>Customer Name *</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: 4, display: 'block' }}>Phone Number *</label>
              <input
                type="tel"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: 4, display: 'block' }}>Village / Location</label>
              <input
                type="text"
                className="input-field"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: 4, display: 'block' }}>Max Credit Limit (₹)</label>
              <input
                type="number"
                className="input-field"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: 6, display: 'block' }}>Customer Tags</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {availableTags.map(tag => {
                const isSelected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--khatta-600)' : 'var(--border-light)',
                      background: isSelected ? 'var(--khatta-600)' : 'var(--bg-card)',
                      color: isSelected ? 'white' : 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: 4, display: 'block' }}>Notes & Instructions</label>
            <textarea
              className="input-field"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pays every month on 5th"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: 6 }}>
            <CheckCircle2 size={18} />
            Update Customer Profile
          </button>
        </form>

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
