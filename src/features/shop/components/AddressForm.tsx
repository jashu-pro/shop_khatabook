import React, { useState } from 'react';
import { MapPin, Globe, Compass, Navigation } from 'lucide-react';
import { INDIAN_STATES } from '@/constants/indianStates';

interface AddressFormProps {
  data: {
    door_number: string;
    street: string;
    area: string;
    village_town: string;
    mandal: string;
    district: string;
    state: string;
    pin_code: string;
    country: string;
  };
  errors: Record<string, string>;
  onChange: (fields: Partial<AddressFormProps['data']>) => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({ data, errors, onChange }) => {
  const [searchTerm, setSearchTerm] = useState(data.state);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredStates = INDIAN_STATES.filter((state) =>
    state.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStateSelect = (stateName: string) => {
    onChange({ state: stateName });
    setSearchTerm(stateName);
    setShowDropdown(false);
  };

  return (
    <div style={styles.formContainer} className="animate-fade-in">
      <h3 style={styles.sectionTitle}>Shop Address</h3>
      <p style={styles.sectionSubtitle}>Enter the physical location details of your store</p>

      <div style={styles.gridRow}>
        <div className="input-group">
          <label className="input-label" htmlFor="door-number">Door Number</label>
          <input
            id="door-number"
            type="text"
            placeholder="No. 12/3"
            className="input-field"
            value={data.door_number}
            onChange={(e) => onChange({ door_number: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="street">Street Name</label>
          <input
            id="street"
            type="text"
            placeholder="Main Bazar St"
            className="input-field"
            value={data.street}
            onChange={(e) => onChange({ street: e.target.value })}
          />
        </div>
      </div>

      <div style={styles.gridRow}>
        <div className="input-group">
          <label className="input-label" htmlFor="area">Area / Locality</label>
          <input
            id="area"
            type="text"
            placeholder="Gandhi Chowk"
            className="input-field"
            value={data.area}
            onChange={(e) => onChange({ area: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="village-town">Village / Town / City *</label>
          <div style={styles.inputWrapper}>
            <MapPin size={16} style={styles.inputIcon} />
            <input
              id="village-town"
              type="text"
              placeholder="Nellore"
              className="input-field"
              style={{ paddingLeft: '40px' }}
              value={data.village_town}
              onChange={(e) => onChange({ village_town: e.target.value })}
              required
            />
          </div>
          {errors.village_town && (
            <span className="input-error-msg">{errors.village_town}</span>
          )}
        </div>
      </div>

      <div style={styles.gridRow}>
        <div className="input-group">
          <label className="input-label" htmlFor="mandal">Mandal / Taluk</label>
          <input
            id="mandal"
            type="text"
            placeholder="Nellore Mandal"
            className="input-field"
            value={data.mandal}
            onChange={(e) => onChange({ mandal: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="district">District *</label>
          <div style={styles.inputWrapper}>
            <Compass size={16} style={styles.inputIcon} />
            <input
              id="district"
              type="text"
              placeholder="SPSR Nellore"
              className="input-field"
              style={{ paddingLeft: '40px' }}
              value={data.district}
              onChange={(e) => onChange({ district: e.target.value })}
              required
            />
          </div>
          {errors.district && (
            <span className="input-error-msg">{errors.district}</span>
          )}
        </div>
      </div>

      <div style={styles.gridRow}>
        {/* Searchable State Dropdown */}
        <div className="input-group" style={{ position: 'relative' }}>
          <label className="input-label" htmlFor="state">State *</label>
          <div style={styles.inputWrapper}>
            <Navigation size={16} style={styles.inputIcon} />
            <input
              id="state"
              type="text"
              placeholder="Search State..."
              className="input-field"
              style={{ paddingLeft: '40px' }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                onChange({ state: e.target.value });
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => {
                // Delay so item selection clicks trigger first
                setTimeout(() => setShowDropdown(false), 200);
              }}
              required
            />
          </div>
          {showDropdown && filteredStates.length > 0 && (
            <div style={styles.dropdown}>
              {filteredStates.map((state) => (
                <button
                  key={state.code}
                  type="button"
                  onClick={() => handleStateSelect(state.name)}
                  style={styles.dropdownItem}
                >
                  {state.name}
                </button>
              ))}
            </div>
          )}
          {errors.state && (
            <span className="input-error-msg">{errors.state}</span>
          )}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="pin-code">PIN Code *</label>
          <input
            id="pin-code"
            type="text"
            placeholder="524001"
            className="input-field"
            value={data.pin_code}
            onChange={(e) => onChange({ pin_code: e.target.value })}
            maxLength={6}
            required
          />
          {errors.pin_code && (
            <span className="input-error-msg">{errors.pin_code}</span>
          )}
        </div>
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="country">Country</label>
        <div style={styles.inputWrapper}>
          <Globe size={16} style={styles.inputIcon} />
          <input
            id="country"
            type="text"
            value={data.country}
            className="input-field"
            style={{ paddingLeft: '40px', backgroundColor: 'var(--bg-tertiary)' }}
            disabled
          />
        </div>
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
  gridRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    width: '100%',
  } as React.CSSProperties,
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  } as React.CSSProperties,
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    maxHeight: '160px',
    overflowY: 'auto',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: 'var(--shadow-lg)',
    zIndex: 999,
  } as React.CSSProperties,
  dropdownItem: {
    width: '100%',
    textAlign: 'left',
    padding: '10px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'background-color var(--transition-fast)',
  } as React.CSSProperties,
};
// Add hover style effect externally or manually
styles.dropdownItem[':hover'] = {
  backgroundColor: 'var(--bg-tertiary)',
};
