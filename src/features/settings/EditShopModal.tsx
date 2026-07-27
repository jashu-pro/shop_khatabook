import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { User, Store, MapPin, Settings, Camera, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const EditShopModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { shop, user, updateShop, createShop, updateShopUser } = useAppStore();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Owner Information
  const [ownerName, setOwnerName] = useState(user?.full_name || 'Jaswanth Majji');
  const [ownerMobile, setOwnerMobile] = useState(user?.phone || '9848012345');
  const [ownerEmail, setOwnerEmail] = useState('jaswanthmajji43@gmail.com');
  const [avatarUrl] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');

  // Step 2: Shop Registration
  const [shopName, setShopName] = useState(shop?.name || 'Sri Srinivasa Kirana Store');
  const [category, setCategory] = useState(shop?.category || 'Kirana / Grocery Store');

  // Step 3: Address Details
  const [doorNo, setDoorNo] = useState(shop?.door_no || '12-4-88');
  const [street, setStreet] = useState(shop?.street || 'Main Road');
  const [area] = useState(shop?.area || 'Clock Tower Area');
  const [villageTown, setVillageTown] = useState(shop?.village_town || 'Anantapur');
  const [mandal, setMandal] = useState(shop?.mandal || 'Anantapur Urban');
  const [district, setDistrict] = useState(shop?.district || 'Anantapur');
  const [state, setState] = useState(shop?.state || 'Andhra Pradesh');
  const [pincode] = useState(shop?.pincode || '515001');

  // Step 4: Business Details & Preferences
  const [gstin, setGstin] = useState(shop?.gstin || '37AAAAA0000A1Z1');
  const [upiId, setUpiId] = useState(shop?.upi_id || 'shopowner@ybl');
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('INR (₹)');
  const [autoReminders, setAutoReminders] = useState(true);
  const [whatsappSharing, setWhatsappSharing] = useState(true);
  const [smsReceipts, setSmsReceipts] = useState(false);
  const [aiSummary, setAiSummary] = useState(true);

  const [error, setError] = useState('');

  const handleFinishRegistration = () => {
    if (!shopName || !villageTown || !district) {
      setError('Please fill in shop name, village/town, and district');
      return;
    }

    const payload = {
      name: shopName,
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
      pan: '',
      upi_id: upiId || 'shopowner@ybl'
    };

    if (shop) {
      updateShop(payload);
    } else {
      createShop(payload);
    }

    if (user?.id) {
      updateShopUser(user.id, { user_name: ownerName, user_phone: ownerMobile });
    }

    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#FFFFFF',
        width: '100%',
        maxWidth: '680px',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #F1F5F9',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Top 4-Step Stepper Bar */}
        <div style={{ background: '#F8FAFC', padding: '24px 32px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {/* Connecting Line */}
            <div style={{ position: 'absolute', top: '18px', left: '40px', right: '40px', height: '2px', background: '#E2E8F0', zIndex: 1 }} />
            
            {[
              { id: 1, label: 'Owner', icon: User },
              { id: 2, label: 'Shop', icon: Store },
              { id: 3, label: 'Address', icon: MapPin },
              { id: 4, label: 'Preferences', icon: Settings }
            ].map((step) => {
              const IconComp = step.icon;
              const isActive = activeStep === step.id;
              const isPassed = activeStep > step.id;

              return (
                <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2, position: 'relative' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: isActive ? '#00BBA6' : isPassed ? '#059669' : '#FFFFFF',
                    color: isActive || isPassed ? '#FFFFFF' : '#94A3B8',
                    border: isActive || isPassed ? 'none' : '2px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isActive ? '0 0 0 4px rgba(0, 187, 166, 0.2)' : 'none',
                    transition: 'all 0.2s'
                  }}>
                    <IconComp size={18} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: isActive ? 800 : 600, color: isActive ? '#00BBA6' : isPassed ? '#059669' : '#64748B' }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '32px' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* Step 1: Owner Information */}
          {activeStep === 1 && (
            <div>
              <h2 style={{ color: '#0F172A', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
                Owner Information
              </h2>
              <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
                Please provide details about the legal shop owner.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '24px', alignItems: 'start' }}>
                {/* Left Profile Avatar */}
                <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto' }}>
                  <img
                    src={avatarUrl}
                    alt="Owner Avatar"
                    style={{ width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover', border: '2px solid #E2E8F0' }}
                  />
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      right: '-6px',
                      bottom: '-6px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#00BBA6',
                      color: 'white',
                      border: '2px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Camera size={16} />
                  </button>
                </div>

                {/* Right Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Jaswanth Majji"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                      MOBILE NUMBER
                    </label>
                    <input
                      type="tel"
                      value={ownerMobile}
                      onChange={(e) => setOwnerMobile(e.target.value)}
                      placeholder="9848012345"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="jaswanthmajji43@gmail.com"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#009677', color: 'white', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <span>Next Step</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Shop Registration */}
          {activeStep === 2 && (
            <div>
              <h2 style={{ color: '#0F172A', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
                Shop Registration
              </h2>
              <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
                Now, enter information for your business storefront.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '24px', alignItems: 'start' }}>
                {/* Left Store Front Photo */}
                <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto' }}>
                  <img
                    src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&auto=format&fit=crop&q=80"
                    alt="Store Front"
                    style={{ width: '100px', height: '100px', borderRadius: '20px', objectFit: 'cover', border: '2px solid #E2E8F0' }}
                  />
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      right: '-6px',
                      bottom: '-6px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#00BBA6',
                      color: 'white',
                      border: '2px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Camera size={16} />
                  </button>
                </div>

                {/* Right Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                      SHOP / TRADE NAME
                    </label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g. Sri Srinivasa Kirana Store"
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                      BUSINESS CATEGORY
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontSize: '13px', outline: 'none' }}
                    >
                      <option value="Kirana / Grocery Store">Kirana / Grocery Store</option>
                      <option value="Supermarket & Provisions">Supermarket & Provisions</option>
                      <option value="Clothing & Apparel">Clothing & Apparel</option>
                      <option value="Electronics & Mobiles">Electronics & Mobiles</option>
                      <option value="Pharmacy & Medicals">Pharmacy & Medicals</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  style={{ padding: '12px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#009677', color: 'white', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <span>Next Step</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Address Details */}
          {activeStep === 3 && (
            <div>
              <h2 style={{ color: '#0F172A', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
                Store Location & Address
              </h2>
              <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
                Enter door number, village/town, mandal, district, state & pincode.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>DOOR / FLAT NO.</label>
                  <input type="text" value={doorNo} onChange={(e) => setDoorNo(e.target.value)} placeholder="12-4-88" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>STREET / LANDMARK</label>
                  <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Main Road" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>VILLAGE / TOWN *</label>
                  <input type="text" value={villageTown} onChange={(e) => setVillageTown(e.target.value)} placeholder="Anantapur" required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>MANDAL</label>
                  <input type="text" value={mandal} onChange={(e) => setMandal(e.target.value)} placeholder="Anantapur Urban" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>DISTRICT *</label>
                  <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Anantapur" required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>STATE</label>
                  <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="Andhra Pradesh" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  style={{ padding: '12px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#009677', color: 'white', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <span>Next Step</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Business Details & Preferences */}
          {activeStep === 4 && (
            <div>
              {/* Red Alert Banner */}
              <div style={{ background: '#FEF2F2', borderLeft: '4px solid #EF4444', padding: '12px 16px', borderRadius: '6px', fontSize: '13px', color: '#991B1B', fontWeight: 600, marginBottom: '20px' }}>
                Please input your UPI ID to allow customers to pay via QR Code.
              </div>

              <h2 style={{ color: '#0F172A', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
                Business Details & Preferences
              </h2>
              <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
                Provide financial particulars and choose notification options.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                    GSTIN (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="37AAAAA0000A1Z1"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                    UPI ID (FOR QR PAYMENTS) *
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="shopowner@ybl"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                    PREFERRED LANGUAGE
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="English">English</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                    DEFAULT CURRENCY
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', fontSize: '13px', outline: 'none' }}
                  >
                    <option value="INR (₹)">INR (₹)</option>
                  </select>
                </div>
              </div>

              {/* Automation & Communication Checkboxes */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
                  Automation & Communication
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    <input type="checkbox" checked={autoReminders} onChange={(e) => setAutoReminders(e.target.checked)} style={{ accentColor: '#009677', borderRadius: '4px' }} />
                    <span>Auto Payment Reminders</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    <input type="checkbox" checked={whatsappSharing} onChange={(e) => setWhatsappSharing(e.target.checked)} style={{ accentColor: '#009677', borderRadius: '4px' }} />
                    <span>WhatsApp Ledger Sharing</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    <input type="checkbox" checked={smsReceipts} onChange={(e) => setSmsReceipts(e.target.checked)} style={{ accentColor: '#009677', borderRadius: '4px' }} />
                    <span>SMS Transaction Receipts</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    <input type="checkbox" checked={aiSummary} onChange={(e) => setAiSummary(e.target.checked)} style={{ accentColor: '#009677', borderRadius: '4px' }} />
                    <span>AI Daily Morning Summary</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  style={{ padding: '12px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinishRegistration}
                  style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#009677', color: 'white', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 150, 119, 0.25)' }}
                >
                  <span>Complete Shop Registration</span>
                  <CheckCircle2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
