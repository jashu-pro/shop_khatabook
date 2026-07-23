import React from 'react';
import { CreditCard, Globe2, CircleDollarSign, CheckSquare, Square, Eye, EyeOff, Sun, Moon, Monitor } from 'lucide-react';
import { APP_LANGUAGES } from '@/constants/languages';
import { APP_CURRENCIES } from '@/constants/currencies';
import { useThemeStore } from '@/store/themeStore';

interface PreferencesFormProps {
  data: {
    gst: string;
    pan: string;
    upi_id: string;
    business_email: string;
    language: string;
    currency: string;
    theme: string;
    payment_reminder: boolean;
    whatsapp_reminder: boolean;
    sms_reminder: boolean;
    ai_daily_summary: boolean;
  };
  errors: Record<string, string>;
  onChange: (fields: Partial<PreferencesFormProps['data']>) => void;
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({ data, errors, onChange }) => {
  const { setTheme } = useThemeStore();

  const handleThemeChange = (selectedTheme: 'light' | 'dark' | 'system') => {
    onChange({ theme: selectedTheme });
    setTheme(selectedTheme); // Apply theme immediately to preview!
  };

  const toggleCheckbox = (key: 'payment_reminder' | 'whatsapp_reminder' | 'sms_reminder' | 'ai_daily_summary') => {
    onChange({ [key]: !data[key] });
  };

  const themeOptions = [
    { mode: 'light' as const, label: 'Light', icon: <Sun size={14} /> },
    { mode: 'dark' as const, label: 'Dark', icon: <Moon size={14} /> },
    { mode: 'system' as const, label: 'System', icon: <Monitor size={14} /> },
  ];

  return (
    <div style={styles.formContainer} className="animate-fade-in">
      <h3 style={styles.sectionTitle}>Business Info & Preferences</h3>
      <p style={styles.sectionSubtitle}>Enter tax details, select preferences, and configure notification triggers</p>

      {/* Tax & UPI */}
      <div style={styles.gridRow}>
        <div className="input-group">
          <label className="input-label" htmlFor="gst">GST Number</label>
          <input
            id="gst"
            type="text"
            placeholder="e.g. 22AAAAA1111A1Z1"
            className="input-field"
            value={data.gst}
            onChange={(e) => onChange({ gst: e.target.value })}
            style={{ textTransform: 'uppercase' }}
          />
          {errors.gst && (
            <span className="input-error-msg">{errors.gst}</span>
          )}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="pan">PAN Number</label>
          <input
            id="pan"
            type="text"
            placeholder="e.g. ABCDE1234F"
            className="input-field"
            value={data.pan}
            onChange={(e) => onChange({ pan: e.target.value })}
            style={{ textTransform: 'uppercase' }}
            maxLength={10}
          />
          {errors.pan && (
            <span className="input-error-msg">{errors.pan}</span>
          )}
        </div>
      </div>

      <div style={styles.gridRow}>
        <div className="input-group">
          <label className="input-label" htmlFor="upi-id">UPI ID for Payments</label>
          <input
            id="upi-id"
            type="text"
            placeholder="merchant@ybl"
            className="input-field"
            value={data.upi_id}
            onChange={(e) => onChange({ upi_id: e.target.value })}
          />
          {errors.upi_id && (
            <span className="input-error-msg">{errors.upi_id}</span>
          )}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="business-email">Business Email</label>
          <input
            id="business-email"
            type="email"
            placeholder="billing@shop.com"
            className="input-field"
            value={data.business_email}
            onChange={(e) => onChange({ business_email: e.target.value })}
          />
          {errors.business_email && (
            <span className="input-error-msg">{errors.business_email}</span>
          )}
        </div>
      </div>

      {/* Language, Currency, Theme */}
      <div style={styles.gridRow}>
        <div className="input-group">
          <label className="input-label" htmlFor="language">Language</label>
          <select
            id="language"
            className="input-field"
            value={data.language}
            onChange={(e) => onChange({ language: e.target.value })}
          >
            {APP_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="currency">Currency</label>
          <select
            id="currency"
            className="input-field"
            value={data.currency}
            onChange={(e) => onChange({ currency: e.target.value })}
          >
            {APP_CURRENCIES.map((cur) => (
              <option key={cur.code} value={cur.code}>
                {cur.symbol} - {cur.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Theme Choice Switcher */}
      <div className="input-group">
        <label className="input-label">App Theme Preference</label>
        <div style={styles.themeGroup}>
          {themeOptions.map((opt) => {
            const isActive = data.theme === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => handleThemeChange(opt.mode)}
                style={{
                  ...styles.themeButton,
                  backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-secondary)',
                  color: isActive ? '#ffffff' : 'var(--text-primary)',
                  borderColor: isActive ? 'var(--primary)' : 'var(--border-color)',
                }}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications Switch Grid */}
      <div style={styles.notificationWrapper}>
        <h4 style={styles.subTitle}>Notification Preferences</h4>
        
        <div style={styles.checkboxGrid}>
          <button
            type="button"
            onClick={() => toggleCheckbox('payment_reminder')}
            style={styles.checkboxItem}
          >
            {data.payment_reminder ? (
              <CheckSquare size={18} style={{ color: 'var(--primary)' }} />
            ) : (
              <Square size={18} style={{ color: 'var(--text-muted)' }} />
            )}
            <div style={styles.checkboxText}>
              <span style={styles.checkboxLabel}>Payment Reminders</span>
              <span style={styles.checkboxDesc}>Send outstanding invoice alerts to customers</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => toggleCheckbox('whatsapp_reminder')}
            style={styles.checkboxItem}
          >
            {data.whatsapp_reminder ? (
              <CheckSquare size={18} style={{ color: 'var(--primary)' }} />
            ) : (
              <Square size={18} style={{ color: 'var(--text-muted)' }} />
            )}
            <div style={styles.checkboxText}>
              <span style={styles.checkboxLabel}>WhatsApp Integration</span>
              <span style={styles.checkboxDesc}>Allow sending ledgers and bills over WhatsApp</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => toggleCheckbox('sms_reminder')}
            style={styles.checkboxItem}
          >
            {data.sms_reminder ? (
              <CheckSquare size={18} style={{ color: 'var(--primary)' }} />
            ) : (
              <Square size={18} style={{ color: 'var(--text-muted)' }} />
            )}
            <div style={styles.checkboxText}>
              <span style={styles.checkboxLabel}>SMS Alerts</span>
              <span style={styles.checkboxDesc}>Trigger direct carrier SMS alerts for collections</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => toggleCheckbox('ai_daily_summary')}
            style={styles.checkboxItem}
          >
            {data.ai_daily_summary ? (
              <CheckSquare size={18} style={{ color: 'var(--primary)' }} />
            ) : (
              <Square size={18} style={{ color: 'var(--text-muted)' }} />
            )}
            <div style={styles.checkboxText}>
              <span style={styles.checkboxLabel}>AI Morning Summary</span>
              <span style={styles.checkboxDesc}>Receive overdue stats and summary morning reports</span>
            </div>
          </button>
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
  themeGroup: {
    display: 'flex',
    gap: '8px',
    width: '100%',
  } as React.CSSProperties,
  themeButton: {
    flex: '1 1 0px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    fontSize: '0.85rem',
    fontWeight: '600',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  } as React.CSSProperties,
  notificationWrapper: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  } as React.CSSProperties,
  subTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  } as React.CSSProperties,
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '12px',
  } as React.CSSProperties,
  checkboxItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color var(--transition-fast)',
  } as React.CSSProperties,
  checkboxText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  } as React.CSSProperties,
  checkboxLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  checkboxDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.3',
  } as React.CSSProperties,
};
