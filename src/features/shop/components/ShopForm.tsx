import React from 'react';
import { Store, Tag } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { BUSINESS_CATEGORIES } from '@/constants/businessCategories';

interface ShopFormProps {
  data: {
    shop_name: string;
    business_category: string;
    shop_logo_url: string;
  };
  errors: Record<string, string>;
  onChange: (fields: Partial<ShopFormProps['data']>) => void;
}

export const ShopForm: React.FC<ShopFormProps> = ({ data, errors, onChange }) => {
  return (
    <div style={styles.formContainer} className="animate-fade-in">
      <h3 style={styles.sectionTitle}>Shop Profile Details</h3>
      <p style={styles.sectionSubtitle}>Enter your business profile name and category</p>

      {/* Shop Logo Capture */}
      <ImageUploader
        id="shop_logo_url"
        value={data.shop_logo_url}
        onChange={(base64) => onChange({ shop_logo_url: base64 })}
        label="Shop Logo"
        placeholderText="Take logo or upload"
        shape="rect"
      />

      <div className="input-group">
        <label className="input-label" htmlFor="shop-name">Shop Name *</label>
        <div style={styles.inputWrapper}>
          <Store size={18} style={styles.inputIcon} />
          <input
            id="shop-name"
            type="text"
            placeholder="Karan Grocery Store"
            className="input-field"
            style={{ paddingLeft: '44px' }}
            value={data.shop_name}
            onChange={(e) => onChange({ shop_name: e.target.value })}
            required
          />
        </div>
        {errors.shop_name && (
          <span className="input-error-msg">{errors.shop_name}</span>
        )}
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="business-category">Business Category *</label>
        <div style={styles.inputWrapper}>
          <Tag size={18} style={styles.inputIcon} />
          <select
            id="business-category"
            className="input-field"
            style={{ paddingLeft: '44px', appearance: 'none', backgroundPosition: 'right 16px center' }}
            value={data.business_category}
            onChange={(e) => onChange({ business_category: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            {BUSINESS_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {errors.business_category && (
          <span className="input-error-msg">{errors.business_category}</span>
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
    zIndex: 2,
  } as React.CSSProperties,
};
