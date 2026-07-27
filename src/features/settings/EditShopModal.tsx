import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { User, Store, MapPin, FileText, Settings, Camera, Image, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 
  'Delhi', 'Puducherry'
];

const BUSINESS_CATEGORIES = [
  'Grocery', 'Clothing', 'Medical', 'Electronics', 'Hardware', 
  'Restaurant', 'Bakery', 'Stationery', 'Mobile Shop', 'Pharmacy', 'Other'
];

export const EditShopModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { shop, user, updateShop, createShop, updateShopUser } = useAppStore();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Owner Info
  const [ownerName, setOwnerName] = useState(user?.full_name || 'Jaswanth Majji');
  const [ownerMobile, setOwnerMobile] = useState(user?.phone || '9848012345');
  const [ownerEmail, setOwnerEmail] = useState('jaswanthmajji43@gmail.com');
  const [ownerPhotoUrl, setOwnerPhotoUrl] = useState(shop?.owner_photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');

  // Step 2: Shop Info
  const [shopName, setShopName] = useState(shop?.shop_name || shop?.name || 'Sri Srinivasa Kirana Store');
  const [shopCategory, setShopCategory] = useState(shop?.business_category || shop?.category || 'Grocery');
  const [shopLogoUrl, setShopLogoUrl] = useState(shop?.shop_logo_url || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200&auto=format&fit=crop&q=80');

  // Step 3: Address
  const [doorNumber, setDoorNumber] = useState(shop?.door_number || shop?.door_no || '12-4-88');
  const [street, setStreet] = useState(shop?.street || 'Main Road');
  const [area, setArea] = useState(shop?.area || 'Clock Tower Center');
  const [village, setVillage] = useState(shop?.village || shop?.village_town || 'Anantapur');
  const [mandal, setMandal] = useState(shop?.mandal || 'Anantapur Urban');
  const [district, setDistrict] = useState(shop?.district || 'Anantapur');
  const [stateName, setStateName] = useState(shop?.state || 'Andhra Pradesh');
  const [pinCode, setPinCode] = useState(shop?.pin_code || shop?.pincode || '515001');
  const [country] = useState('India');

  // Step 4: Business Details
  const [gst, setGst] = useState(shop?.gst || shop?.gstin || '37AAAAA0000A1Z1');
  const [pan, setPan] = useState(shop?.pan || 'ABCDE1234F');
  const [upiId, setUpiId] = useState(shop?.upi_id || 'shopowner@ybl');
  const [businessEmail, setBusinessEmail] = useState(shop?.business_email || 'srilaxmitraders@gmail.com');

  // Step 5: Preferences
  const [language, setLanguage] = useState(shop?.language || 'English');
  const [currency, setCurrency] = useState(shop?.currency || 'INR');
  const [theme, setTheme] = useState<'Light' | 'Dark' | 'System'>(shop?.theme || 'Light');
  const [paymentReminder, setPaymentReminder] = useState(shop?.payment_reminder !== false);
  const [whatsappReminder, setWhatsappReminder] = useState(shop?.whatsapp_reminder !== false);
  const [smsReminder, setSmsReminder] = useState(shop?.sms_reminder === true);
  const [aiDailySummary, setAiDailySummary] = useState(shop?.ai_daily_summary !== false);

  const [error, setError] = useState('');

  // Image Upload Simulation
  const handlePhotoUpload = (type: 'owner' | 'logo', source: 'camera' | 'gallery') => {
    const newSample = source === 'camera'
      ? 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80';
    if (type === 'owner') setOwnerPhotoUrl(newSample);
    else setShopLogoUrl(newSample);
  };

  const validateStep4 = (): boolean => {
    if (gst && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst)) {
      setError('Please enter a valid 15-character GSTIN (e.g. 37AAAAA0000A1Z1)');
      return false;
    }
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      setError('Please enter a valid 10-character PAN number (e.g. ABCDE1234F)');
      return false;
    }
    if (upiId && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
      setError('Please enter a valid UPI ID (e.g. shopowner@ybl)');
      return false;
    }
    return true;
  };

  const handleFinishRegistration = () => {
    if (!shopName || !village || !district) {
      setError('Please enter shop name, village/town, and district');
      return;
    }

    if (!validateStep4()) return;

    const payload = {
      owner_id: user?.id || 'user-1',
      shop_name: shopName,
      name: shopName,
      shop_logo_url: shopLogoUrl,
      shop_logo_path: `shop-logos/${user?.id || 'user-1'}/logo.jpg`,
      owner_photo_url: ownerPhotoUrl,
      owner_photo_path: `owner-photos/${user?.id || 'user-1'}/profile.jpg`,
      business_category: shopCategory,
      category: shopCategory,
      door_number: doorNumber,
      door_no: doorNumber,
      street,
      area,
      village,
      village_town: village,
      mandal,
      district,
      state: stateName,
      pin_code: pinCode,
      pincode: pinCode,
      country,
      gst,
      gstin: gst,
      pan,
      upi_id: upiId,
      business_email: businessEmail,
      language,
      currency,
      theme,
      payment_reminder: paymentReminder,
      whatsapp_reminder: whatsappReminder,
      sms_reminder: smsReminder,
      ai_daily_summary: aiDailySummary
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
        maxWidth: '720px',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #F1F5F9',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Top 5-Step Progress Bar */}
        <div style={{ background: '#F8FAFC', padding: '24px 28px', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '18px', left: '30px', right: '30px', height: '2px', background: '#E2E8F0', zIndex: 1 }} />
            
            {[
              { id: 1, label: 'Owner', icon: User },
              { id: 2, label: 'Shop', icon: Store },
              { id: 3, label: 'Address', icon: MapPin },
              { id: 4, label: 'Business', icon: FileText },
              { id: 5, label: 'Preferences', icon: Settings }
            ].map((stepItem) => {
              const IconComp = stepItem.icon;
              const isActive = activeStep === stepItem.id;
              const isPassed = activeStep > stepItem.id;

              return (
                <div key={stepItem.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2, position: 'relative' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isActive ? '#059669' : isPassed ? '#10B981' : '#FFFFFF',
                    color: isActive || isPassed ? '#FFFFFF' : '#94A3B8',
                    border: isActive || isPassed ? 'none' : '2px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isActive ? '0 0 0 4px rgba(5, 150, 105, 0.2)' : 'none',
                    transition: 'all 0.2s'
                  }}>
                    <IconComp size={16} />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: isActive ? 800 : 600, color: isActive ? '#059669' : isPassed ? '#10B981' : '#64748B' }}>
                    {stepItem.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '32px' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: OWNER INFORMATION */}
          {activeStep === 1 && (
            <div>
              <h2 style={{ color: '#0F172A', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
                Step 1: Owner Information
              </h2>
              <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
                Provide details and photo of the primary shop owner.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '24px', alignItems: 'start' }}>
                {/* Photo & Upload Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <img src={ownerPhotoUrl} alt="Owner Photo" style={{ width: '110px', height: '110px', borderRadius: '20px', objectFit: 'cover', border: '2px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={() => handlePhotoUpload('owner', 'camera')} title="Camera" style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Camera size={13} color="#059669" />
                      <span>Camera</span>
                    </button>
                    <button type="button" onClick={() => handlePhotoUpload('owner', 'gallery')} title="Gallery" style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Image size={13} color="#059669" />
                      <span>Gallery</span>
                    </button>
                  </div>
                </div>

                {/* Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>FULL NAME *</label>
                    <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Jaswanth Majji" style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>MOBILE NUMBER *</label>
                    <input type="tel" value={ownerMobile} onChange={(e) => setOwnerMobile(e.target.value)} placeholder="9848012345" style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>EMAIL (PREFILLED)</label>
                    <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="jaswanthmajji43@gmail.com" style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button type="button" onClick={() => { setError(''); setActiveStep(2); }} style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#059669', color: 'white', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <span>Next Step</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SHOP INFORMATION */}
          {activeStep === 2 && (
            <div>
              <h2 style={{ color: '#0F172A', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
                Step 2: Shop Information
              </h2>
              <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
                Enter business storefront name, category, and brand logo.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '24px', alignItems: 'start' }}>
                {/* Shop Logo & Upload Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <img src={shopLogoUrl} alt="Shop Logo" style={{ width: '110px', height: '110px', borderRadius: '20px', objectFit: 'cover', border: '2px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" onClick={() => handlePhotoUpload('logo', 'camera')} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Camera size={13} color="#059669" />
                      <span>Camera</span>
                    </button>
                    <button type="button" onClick={() => handlePhotoUpload('logo', 'gallery')} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Image size={13} color="#059669" />
                      <span>Gallery</span>
                    </button>
                  </div>
                </div>

                {/* Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>SHOP / STORE NAME *</label>
                    <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Sri Srinivasa Kirana Store" style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>BUSINESS CATEGORY *</label>
                    <select value={shopCategory} onChange={(e) => setShopCategory(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px', outline: 'none' }}>
                      {BUSINESS_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                <button type="button" onClick={() => { setError(''); setActiveStep(1); }} style={{ padding: '12px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button type="button" onClick={() => { setError(''); setActiveStep(3); }} style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#059669', color: 'white', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <span>Next Step</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ADDRESS */}
          {activeStep === 3 && (
            <div>
              <h2 style={{ color: '#0F172A', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
                Step 3: Store Address
              </h2>
              <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
                Enter complete location details for your business outlet.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>DOOR NUMBER</label>
                  <input type="text" value={doorNumber} onChange={(e) => setDoorNumber(e.target.value)} placeholder="12-4-88" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>STREET</label>
                  <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Main Road" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>AREA / LANDMARK</label>
                  <input type="text" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Clock Tower Center" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>VILLAGE / TOWN *</label>
                  <input type="text" value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Anantapur" required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px' }} />
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
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>STATE (SEARCHABLE)</label>
                  <select value={stateName} onChange={(e) => setStateName(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px' }}>
                    {INDIAN_STATES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>PIN CODE</label>
                  <input type="text" value={pinCode} onChange={(e) => setPinCode(e.target.value)} placeholder="515001" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                <button type="button" onClick={() => { setError(''); setActiveStep(2); }} style={{ padding: '12px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button type="button" onClick={() => { setError(''); setActiveStep(4); }} style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#059669', color: 'white', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <span>Next Step</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: BUSINESS DETAILS & ZOD VALIDATION */}
          {activeStep === 4 && (
            <div>
              <h2 style={{ color: '#0F172A', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
                Step 4: Business Particulars
              </h2>
              <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
                Provide GSTIN, PAN, UPI ID, and Official Business Email.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>GST NUMBER (15 CHARS)</label>
                  <input type="text" value={gst} onChange={(e) => setGst(e.target.value.toUpperCase())} placeholder="37AAAAA0000A1Z1" style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>PAN NUMBER (10 CHARS)</label>
                  <input type="text" value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} placeholder="ABCDE1234F" style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>UPI ID (FOR QR PAYMENTS) *</label>
                  <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="shopowner@ybl" style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>BUSINESS EMAIL</label>
                  <input type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} placeholder="srilaxmitraders@gmail.com" style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                <button type="button" onClick={() => { setError(''); setActiveStep(3); }} style={{ padding: '12px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button type="button" onClick={() => { if (validateStep4()) { setError(''); setActiveStep(5); } }} style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#059669', color: 'white', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <span>Next Step</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: PREFERENCES & NOTIFICATION SETTINGS */}
          {activeStep === 5 && (
            <div>
              <h2 style={{ color: '#0F172A', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
                Step 5: Preferences & Automation
              </h2>
              <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
                Configure language, currency, theme, and automated alert preferences.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>LANGUAGE</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px' }}>
                    <option value="English">English</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>CURRENCY</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px' }}>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>THEME</label>
                  <select value={theme} onChange={(e) => setTheme(e.target.value as any)} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px' }}>
                    <option value="Light">Light</option>
                    <option value="Dark">Dark</option>
                    <option value="System">System</option>
                  </select>
                </div>
              </div>

              {/* Notification Toggles */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
                  Notification & Automation Settings
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                    <input type="checkbox" checked={paymentReminder} onChange={(e) => setPaymentReminder(e.target.checked)} style={{ accentColor: '#059669' }} />
                    <span>Payment Reminder</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                    <input type="checkbox" checked={whatsappReminder} onChange={(e) => setWhatsappReminder(e.target.checked)} style={{ accentColor: '#059669' }} />
                    <span>WhatsApp Reminder</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                    <input type="checkbox" checked={smsReminder} onChange={(e) => setSmsReminder(e.target.checked)} style={{ accentColor: '#059669' }} />
                    <span>SMS Reminder</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                    <input type="checkbox" checked={aiDailySummary} onChange={(e) => setAiDailySummary(e.target.checked)} style={{ accentColor: '#059669' }} />
                    <span>AI Daily Summary</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                <button type="button" onClick={() => { setError(''); setActiveStep(4); }} style={{ padding: '12px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button type="button" onClick={handleFinishRegistration} style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#059669', color: 'white', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)' }}>
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
