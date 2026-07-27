import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { Store, MapPin, Building2, Save } from 'lucide-react';

export const EditShopModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { shop, updateShop } = useAppStore();

  const [name, setName] = useState(shop?.name || '');
  const [category, setCategory] = useState(shop?.category || 'Kirana & General Store');
  const [doorNo, setDoorNo] = useState(shop?.door_no || '');
  const [street, setStreet] = useState(shop?.street || '');
  const [area, setArea] = useState(shop?.area || '');
  const [villageTown, setVillageTown] = useState(shop?.village_town || '');
  const [mandal, setMandal] = useState(shop?.mandal || '');
  const [district, setDistrict] = useState(shop?.district || '');
  const [state, setState] = useState(shop?.state || 'Andhra Pradesh');
  const [pincode, setPincode] = useState(shop?.pincode || '');
  const [gstin, setGstin] = useState(shop?.gstin || '');
  const [pan, setPan] = useState(shop?.pan || '');
  const [upiId, setUpiId] = useState(shop?.upi_id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !villageTown || !district) return;

    updateShop({
      name,
      category,
      door_no: doorNo,
      street,
      area,
      village_town: villageTown,
      mandal,
      district,
      state,
      pincode,
      gstin,
      pan,
      upi_id: upiId
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--khatta-100)', color: 'var(--khatta-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px' }}>Register / Edit Store Details</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Business Profile, Address & Tax GSTIN Settings</p>
            </div>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Store Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700 }}>Shop Business Name *</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Sri Laxmi Traders"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 700 }}>Business Category *</label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Kirana & General Store">Kirana & General Store</option>
                <option value="Supermarket & Provisions">Supermarket & Provisions</option>
                <option value="Clothing & Apparel">Clothing & Apparel</option>
                <option value="Electronics & Mobiles">Electronics & Mobiles</option>
                <option value="Pharmacy & Medicals">Pharmacy & Medicals</option>
                <option value="Hardware & Sanitaryware">Hardware & Sanitaryware</option>
                <option value="Bakery & Confectionery">Bakery & Confectionery</option>
                <option value="Restaurant & Food Court">Restaurant & Food Court</option>
                <option value="Other Retail Store">Other Retail Store</option>
              </select>
            </div>
          </div>

          {/* Address Section Header */}
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--khatta-700)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <MapPin size={14} />
            <span>STORE LOCATION ADDRESS</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700 }}>Door / Shop No.</label>
              <input type="text" className="input-field" placeholder="D.No 4-12" value={doorNo} onChange={(e) => setDoorNo(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700 }}>Street Name</label>
              <input type="text" className="input-field" placeholder="Main Road" value={street} onChange={(e) => setStreet(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700 }}>Area / Landmark</label>
              <input type="text" className="input-field" placeholder="Clock Tower" value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700 }}>Village / Town *</label>
              <input type="text" className="input-field" placeholder="Anantapur" value={villageTown} onChange={(e) => setVillageTown(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700 }}>Mandal</label>
              <input type="text" className="input-field" placeholder="Anantapur Urban" value={mandal} onChange={(e) => setMandal(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700 }}>District *</label>
              <input type="text" className="input-field" placeholder="Anantapur" value={district} onChange={(e) => setDistrict(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700 }}>State</label>
              <input type="text" className="input-field" placeholder="Andhra Pradesh" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700 }}>Pincode</label>
              <input type="text" className="input-field" placeholder="515001" value={pincode} onChange={(e) => setPincode(e.target.value)} />
            </div>
          </div>

          {/* Tax & UPI Section Header */}
          <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--khatta-700)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Building2 size={14} />
            <span>TAX & UPI PAYMENT SETTINGS</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700 }}>Shop UPI ID (for QR)</label>
              <input type="text" className="input-field" placeholder="srilaxmi@ybl" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700 }}>GSTIN No. (Optional)</label>
              <input type="text" className="input-field" placeholder="37AAAAA0000A1Z5" value={gstin} onChange={(e) => setGstin(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700 }}>PAN No. (Optional)</label>
              <input type="text" className="input-field" placeholder="ABCDE1234F" value={pan} onChange={(e) => setPan(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              <Save size={16} />
              <span>Save Store Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
