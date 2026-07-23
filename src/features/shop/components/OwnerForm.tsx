import React from 'react';
import { User, Phone, Mail } from 'lucide-react';
import { ImageUploader } from './ImageUploader';

interface OwnerFormProps {
  data: {
    owner_name: string;
    owner_phone: string;
    business_email: string;
    owner_photo_url: string;
  };
  errors: Record<string, string>;
  onChange: (fields: Partial<OwnerFormProps['data']>) => void;
}

export const OwnerForm: React.FC<OwnerFormProps> = ({ data, errors, onChange }) => {
  return (
    <div style={styles.formContainer} className="animate-fade-in">
      <h3 style={styles.sectionTitle}>Owner Profile Details</h3>
      <p style={styles.sectionSubtitle}>Ensure your personal contact details are correct</p>

      {/* Owner Photo Capture */}
      <ImageUploader
        id="owner_photo_url"
        value={data.owner_photo_url}
        onChange={(base64) => onChange({ owner_photo_url: base64 })}
        label="Owner Photo"
        placeholderText="Take photo or upload"
        shape="circle"
      />

      <div className="input-group">
        <label className="input-label" htmlFor="owner-name">Full Name *</label>
        <div style={styles.inputWrapper}>
          <User size={18} style={styles.inputIcon} />
          <input
            id="owner-name"
            type="text"
            placeholder="Ramesh Kumar"
            className="input-field"
            style={{ paddingLeft: '44px' }}
            value={data.owner_name}
            onChange={(e) => onChange({ owner_name: e.target.value })}
            required
          />
        </div>
        {errors.owner_name && (
          <span className="input-error-msg">{errors.owner_name}</span>
        )}
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="owner-phone">Mobile Number *</label>
        <div style={styles.inputWrapper}>
          <Phone size={18} style={styles.inputIcon} />
          <input
            id="owner-phone"
            type="tel"
            placeholder="9876543210"
            className="input-field"
            style={{ paddingLeft: '44px' }}
            value={data.owner_phone}
            onChange={(e) => onChange({ owner_phone: e.target.value })}
            required
          />
        </div>
        {errors.owner_phone && (
          <span className="input-error-msg">{errors.owner_phone}</span>
        )}
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="owner-email">Personal Email Address</label>
        <div style={styles.inputWrapper}>
          <Mail size={18} style={styles.inputIcon} />
          <input
            id="owner-email"
            type="email"
            placeholder="owner@example.com"
            className="input-field"
            style={{ paddingLeft: '44px' }}
            value={data.business_email}
            onChange={(e) => onChange({ business_email: e.target.value })}
          />
        </div>
        {errors.business_email && (
          <span className="input-error-msg">{errors.business_email}</span>
        )}
      </div>
    </div>
  );
};

const styles = {
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  sectionSubtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
  } as React.CSSProperties,
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  } as React.CSSProperties,
};
