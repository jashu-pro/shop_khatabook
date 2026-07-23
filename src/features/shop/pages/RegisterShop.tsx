import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useCreateShopMutation } from '../hooks/useShop';
import { shopService } from '../services/shop.service';
import { Stepper } from '../components/Stepper';
import { OwnerForm } from '../components/OwnerForm';
import { ShopForm } from '../components/ShopForm';
import { AddressForm } from '../components/AddressForm';
import { PreferencesForm } from '../components/PreferencesForm';
import { shopRegistrationSchema } from '../validation/shop.schema';
import { APP_NAME } from '@/constants/env';
import { Loader2, ArrowLeft, ArrowRight, ShieldAlert, Store } from 'lucide-react';

export const RegisterShop: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const createShopMutation = useCreateShopMutation();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    owner_name: '',
    owner_phone: '',
    owner_photo_url: '',
    owner_photo_path: '',
    shop_name: '',
    business_category: '',
    shop_logo_url: '',
    shop_logo_path: '',
    door_number: '',
    street: '',
    area: '',
    village_town: '',
    mandal: '',
    district: '',
    state: '',
    pin_code: '',
    country: 'India',
    gst: '',
    pan: '',
    upi_id: '',
    business_email: '',
    language: 'en',
    currency: 'INR',
    theme: 'system',
    payment_reminder: true,
    whatsapp_reminder: true,
    sms_reminder: false,
    ai_daily_summary: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Pre-populate owner details from user metadata when session loads
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        owner_name: prev.owner_name || user.user_metadata?.full_name || '',
        owner_phone: prev.owner_phone || user.user_metadata?.phone_number || '',
        owner_photo_url: prev.owner_photo_url || user.user_metadata?.avatar_url || '',
      }));
    }
  }, [user]);

  const steps = ['Owner Info', 'Shop Info', 'Address', 'Preferences'];

  const updateFields = (fields: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  // Validate the inputs for the current active wizard step
  const validateStep = (): boolean => {
    setErrors({});
    let schemaToValidate;

    if (step === 1) {
      schemaToValidate = shopRegistrationSchema.pick({
        owner_name: true,
        owner_phone: true,
      });
    } else if (step === 2) {
      schemaToValidate = shopRegistrationSchema.pick({
        shop_name: true,
        business_category: true,
      });
    } else if (step === 3) {
      schemaToValidate = shopRegistrationSchema.pick({
        village_town: true,
        district: true,
        state: true,
        pin_code: true,
      });
    } else {
      schemaToValidate = shopRegistrationSchema;
    }

    const result = schemaToValidate.safeParse(formData);
    if (!result.success) {
      const stepErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        stepErrors[path] = issue.message;
      });
      setErrors(stepErrors);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 4) {
        setStep((s) => s + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  // Generate a unique shop code like SKB183952
  const generateShopCode = (): string => {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `SKB${random}`;
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const ownerId = user.id;
      let finalOwnerPhotoUrl = formData.owner_photo_url;
      let finalOwnerPhotoPath = '';
      let finalShopLogoUrl = formData.shop_logo_url;
      let finalShopLogoPath = '';

      // 1. Upload owner photo if base64 captures are present
      if (formData.owner_photo_url && formData.owner_photo_url.startsWith('data:image')) {
        const uploadResult = await shopService.uploadImage(
          'owner-photos',
          ownerId,
          'profile.jpg',
          formData.owner_photo_url
        );
        if (uploadResult) {
          finalOwnerPhotoUrl = uploadResult.url;
          finalOwnerPhotoPath = uploadResult.path;
        }
      }

      // 2. Upload shop logo if base64 captures are present
      if (formData.shop_logo_url && formData.shop_logo_url.startsWith('data:image')) {
        const uploadResult = await shopService.uploadImage(
          'shop-logos',
          ownerId,
          'logo.jpg',
          formData.shop_logo_url
        );
        if (uploadResult) {
          finalShopLogoUrl = uploadResult.url;
          finalShopLogoPath = uploadResult.path;
        }
      }

      // 3. Generate shop code
      let shopCode = generateShopCode();
      let attempts = 0;
      let codeExists = await shopService.checkShopCodeExists(shopCode);
      while (codeExists && attempts < 5) {
        shopCode = generateShopCode();
        codeExists = await shopService.checkShopCodeExists(shopCode);
        attempts++;
      }

      // 4. Create Shop Payload
      const shopInput = {
        owner_id: ownerId,
        owner_name: formData.owner_name.trim(),
        owner_phone: formData.owner_phone.trim(),
        owner_photo_url: finalOwnerPhotoUrl || null,
        owner_photo_path: finalOwnerPhotoPath || null,
        
        shop_name: formData.shop_name.trim(),
        shop_code: shopCode,
        shop_logo_url: finalShopLogoUrl || null,
        shop_logo_path: finalShopLogoPath || null,
        business_category: formData.business_category,
        
        door_number: formData.door_number.trim() || null,
        street: formData.street.trim() || null,
        area: formData.area.trim() || null,
        village_town: formData.village_town.trim(),
        mandal: formData.mandal.trim() || null,
        district: formData.district.trim(),
        state: formData.state.trim(),
        pin_code: formData.pin_code.trim(),
        country: formData.country,
        
        gst: formData.gst.trim() || null,
        pan: formData.pan.trim() || null,
        upi_id: formData.upi_id.trim() || null,
        business_email: formData.business_email.trim() || null,
        
        language: formData.language,
        currency: formData.currency,
        theme: formData.theme,
        
        payment_reminder: formData.payment_reminder,
        whatsapp_reminder: formData.whatsapp_reminder,
        sms_reminder: formData.sms_reminder,
        ai_daily_summary: formData.ai_daily_summary,
      };

      await createShopMutation.mutateAsync(shopInput);
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Registration submit error:', err);
      setSubmitError(err.message || 'Failed to register your shop. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header} className="glass-panel">
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <Store size={18} style={{ color: '#ffffff' }} />
          </div>
          <span style={styles.headerAppName}>{APP_NAME} Onboarding</span>
        </div>
        <button onClick={handleLogout} className="btn btn-outline" style={styles.logoutBtn}>
          Sign Out
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.card} className="glass-panel animate-fade-in">
          <div style={styles.wizardHeader}>
            <h2 style={styles.title}>Register Your Shop</h2>
            <p style={styles.subtitle}>Complete onboarding to launch Credora ledger notebooks</p>
          </div>

          <Stepper currentStep={step} steps={steps} />

          {submitError && (
            <div style={styles.errorAlert}>
              <ShieldAlert size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem' }}>{submitError}</span>
            </div>
          )}

          {/* Form Wizard Steps */}
          <div style={styles.formWrapper}>
            {step === 1 && (
              <OwnerForm data={formData} errors={errors} onChange={updateFields} />
            )}
            {step === 2 && (
              <ShopForm data={formData} errors={errors} onChange={updateFields} />
            )}
            {step === 3 && (
              <AddressForm data={formData} errors={errors} onChange={updateFields} />
            )}
            {step === 4 && (
              <PreferencesForm data={formData} errors={errors} onChange={updateFields} />
            )}
          </div>

          <div style={styles.divider} />

          {/* Navigation Controls */}
          <div style={styles.actionControls}>
            <button
              type="button"
              onClick={handleBack}
              className="btn btn-secondary"
              style={{ ...styles.actionBtn, visibility: step === 1 ? 'hidden' : 'visible' }}
              disabled={submitting}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
              style={styles.actionBtn}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>{step === 4 ? 'Complete Setup' : 'Continue'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    margin: '16px 24px 0 24px',
    borderRadius: 'var(--radius-md)',
  } as React.CSSProperties,
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as React.CSSProperties,
  headerIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
  } as React.CSSProperties,
  headerAppName: {
    fontWeight: '700',
    fontSize: '1rem',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  logoutBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem',
  } as React.CSSProperties,
  main: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  } as React.CSSProperties,
  card: {
    maxWidth: '580px',
    width: '100%',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  } as React.CSSProperties,
  wizardHeader: {
    textAlign: 'center',
  } as React.CSSProperties,
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  } as React.CSSProperties,
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--danger-light)',
    border: '1px solid var(--danger)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 16px',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  formWrapper: {
    minHeight: '260px',
  } as React.CSSProperties,
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'var(--border-color)',
  } as React.CSSProperties,
  actionControls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  } as React.CSSProperties,
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
  } as React.CSSProperties,
};
