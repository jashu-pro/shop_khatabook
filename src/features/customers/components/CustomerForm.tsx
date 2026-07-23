import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Wallet, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { ImageUploader } from '@/features/shop/components/ImageUploader';
import { customerSchema } from '../validation/customer.schema';
import { customerService } from '../services/customer.service';
import type { Customer } from '../types/customer.types';

interface CustomerFormProps {
  customer?: Customer; // if provided, we edit
  shopId: string;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    phone: string | null;
    photo_url: string | null;
    photo_path: string | null;
    village: string | null;
    address: string | null;
    notes: string | null;
    credit_limit: number;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  shopId,
  onClose,
  onSave,
  isSubmitting,
}) => {
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [village, setVillage] = useState(customer?.village || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [creditLimit, setCreditLimit] = useState(customer?.credit_limit?.toString() || '10000');
  const [notes, setNotes] = useState(customer?.notes || '');
  const [photoUrl, setPhotoUrl] = useState(customer?.photo_url || '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  const handlePhoneBlur = async () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setDuplicateWarning(false);
      return;
    }
    setCheckingPhone(true);
    try {
      const exists = await customerService.checkPhoneExists(shopId, trimmedPhone, customer?.id);
      setDuplicateWarning(exists);
    } catch (err) {
      console.error('Error checking duplicate phone:', err);
    } finally {
      setCheckingPhone(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      name: name.trim(),
      phone: phone.trim(),
      village: village.trim(),
      address: address.trim(),
      credit_limit: creditLimit.trim() === '' ? 0 : Number(creditLimit),
      notes: notes.trim(),
    };

    // Zod parsing
    const result = customerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      // 1. Upload photo if it's base64 data
      let finalPhotoUrl = photoUrl;
      let finalPhotoPath = customer?.photo_path || null;

      if (photoUrl && photoUrl.startsWith('data:image')) {
        const timestamp = Date.now();
        const uploadResult = await customerService.uploadPhoto(
          shopId,
          `customer_${timestamp}.jpg`,
          photoUrl
        );
        if (uploadResult) {
          finalPhotoUrl = uploadResult.url;
          finalPhotoPath = uploadResult.path;
        }
      }

      await onSave({
        name: formData.name,
        phone: formData.phone || null,
        photo_url: finalPhotoUrl || null,
        photo_path: finalPhotoPath,
        village: formData.village || null,
        address: formData.address || null,
        notes: formData.notes || null,
        credit_limit: formData.credit_limit,
      });
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save customer data.' });
    }
  };

  return (
    <div style={styles.backdrop} className="animate-fade-in">
      <div style={styles.modal} className="glass-panel animate-slide-up">
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>
            {customer ? 'Edit Customer' : 'Add New Customer'}
          </h3>
          <button onClick={onClose} style={styles.closeBtn} disabled={isSubmitting}>
            <X size={18} />
          </button>
        </div>

        <div style={styles.divider} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.scrollArea}>
            {/* Form Error Alert */}
            {errors.form && (
              <div style={styles.errorAlert}>
                <AlertTriangle size={16} />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Photo Upload */}
            <div style={styles.uploaderWrapper}>
              <ImageUploader
                id="customer_photo"
                value={photoUrl}
                onChange={(base64) => setPhotoUrl(base64)}
                label="Customer Photo"
                placeholderText="Capture or upload photo"
                shape="circle"
              />
            </div>

            {/* Name */}
            <div className="input-group">
              <label className="input-label" htmlFor="cust-name">Customer Name *</label>
              <div style={styles.inputWrapper}>
                <User size={16} style={styles.inputIcon} />
                <input
                  id="cust-name"
                  type="text"
                  placeholder="Karan Sharma"
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              {errors.name && <span className="input-error-msg">{errors.name}</span>}
            </div>

            {/* Phone */}
            <div className="input-group">
              <label className="input-label" htmlFor="cust-phone">Mobile Number</label>
              <div style={styles.inputWrapper}>
                <Phone size={16} style={styles.inputIcon} />
                <input
                  id="cust-phone"
                  type="tel"
                  placeholder="9876543210"
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={handlePhoneBlur}
                />
                {checkingPhone && (
                  <Loader2 size={16} className="animate-spin" style={styles.spinnerIcon} />
                )}
              </div>
              {errors.phone && <span className="input-error-msg">{errors.phone}</span>}

              {/* Duplicate warnings banner */}
              {duplicateWarning && (
                <div style={styles.warningBox}>
                  <AlertTriangle size={14} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                  <span style={styles.warningText}>
                    A customer with this phone number already exists in your shop ledger.
                  </span>
                </div>
              )}
            </div>

            {/* Village */}
            <div className="input-group">
              <label className="input-label" htmlFor="cust-village">Village / Town</label>
              <div style={styles.inputWrapper}>
                <MapPin size={16} style={styles.inputIcon} />
                <input
                  id="cust-village"
                  type="text"
                  placeholder="Ramapuram"
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                />
              </div>
              {errors.village && <span className="input-error-msg">{errors.village}</span>}
            </div>

            {/* Credit Limit */}
            <div className="input-group">
              <label className="input-label" htmlFor="cust-limit">Credit Limit (₹) *</label>
              <div style={styles.inputWrapper}>
                <Wallet size={16} style={styles.inputIcon} />
                <input
                  id="cust-limit"
                  type="number"
                  placeholder="10000"
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  min="0"
                  required
                />
              </div>
              {errors.credit_limit && (
                <span className="input-error-msg">{errors.credit_limit}</span>
              )}
            </div>

            {/* Address */}
            <div className="input-group">
              <label className="input-label" htmlFor="cust-address">Full Address</label>
              <div style={styles.inputWrapper}>
                <MapPin size={16} style={{ ...styles.inputIcon, top: '14px' }} />
                <textarea
                  id="cust-address"
                  placeholder="Door No, Street Name, Landmark..."
                  className="input-field"
                  style={{ paddingLeft: '40px', minHeight: '60px', resize: 'vertical', paddingTop: '8px' }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="input-group">
              <label className="input-label" htmlFor="cust-notes">Additional Notes / Landmarks</label>
              <div style={styles.inputWrapper}>
                <FileText size={16} style={{ ...styles.inputIcon, top: '14px' }} />
                <textarea
                  id="cust-notes"
                  placeholder="e.g. Relies on cotton sales pay cycles. Milk supplier."
                  className="input-field"
                  style={{ paddingLeft: '40px', minHeight: '60px', resize: 'vertical', paddingTop: '8px' }}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={styles.actionBtn}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={styles.actionBtn}
              disabled={isSubmitting || checkingPhone}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Customer</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '20px',
  } as React.CSSProperties,
  modal: {
    maxWidth: '460px',
    width: '100%',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
    boxShadow: 'var(--shadow-lg)',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
  } as React.CSSProperties,
  title: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  closeBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: '4px',
    display: 'flex',
  } as React.CSSProperties,
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'var(--border-color)',
  } as React.CSSProperties,
  form: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  } as React.CSSProperties,
  scrollArea: {
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    flexGrow: 1,
  } as React.CSSProperties,
  uploaderWrapper: {
    alignSelf: 'center',
    marginBottom: '8px',
    width: '100%',
  } as React.CSSProperties,
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  } as React.CSSProperties,
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  } as React.CSSProperties,
  spinnerIcon: {
    position: 'absolute',
    right: '14px',
    color: 'var(--text-muted)',
  } as React.CSSProperties,
  warningBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    backgroundColor: 'var(--warning-light)',
    border: '1px solid var(--warning)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 12px',
    marginTop: '6px',
  } as React.CSSProperties,
  warningText: {
    fontSize: '0.75rem',
    color: 'var(--text-primary)',
    lineHeight: '1.4',
  } as React.CSSProperties,
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--danger-light)',
    border: '1px solid var(--danger)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: '0.8rem',
  } as React.CSSProperties,
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 20px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '0 0 var(--radius-md) var(--radius-md)',
  } as React.CSSProperties,
  actionBtn: {
    padding: '10px 20px',
    fontSize: '0.85rem',
  } as React.CSSProperties,
};
