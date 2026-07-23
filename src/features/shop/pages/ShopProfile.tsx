import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useShopQuery } from '../hooks/useShop';
import { Link } from 'react-router-dom';
import { ArrowLeft, Store, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { LoadingScreen } from '@/components/common/LoadingScreen';

export const ShopProfile: React.FC = () => {
  const { user } = useAuthStore();
  const { data: shop, isLoading } = useShopQuery(user?.id);

  if (isLoading) {
    return <LoadingScreen message="Loading shop profile..." />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass-panel animate-fade-in">
        <Link to="/" style={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Onboarding Dashboard</span>
        </Link>

        <div style={styles.header}>
          {shop?.shop_logo_url ? (
            <img src={shop.shop_logo_url} alt="Shop Logo" style={styles.logo} />
          ) : (
            <div style={styles.logoPlaceholder}>
              <Store size={32} style={{ color: 'var(--text-muted)' }} />
            </div>
          )}
          
          <div style={styles.headerText}>
            <h1 style={styles.shopName}>{shop?.shop_name || 'Shop Profile'}</h1>
            <span style={styles.shopCode}>Code: {shop?.shop_code || 'N/A'}</span>
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.infoSection}>
          <h3 style={styles.sectionTitle}>Registration Status</h3>
          <div style={styles.statusBox}>
            <ShieldCheck size={20} style={{ color: 'var(--success)' }} />
            <div style={styles.statusTextGroup}>
              <span style={styles.statusTitle}>Successfully Registered</span>
              <span style={styles.statusDesc}>Your shop details are safely linked to your owner profile.</span>
            </div>
          </div>
        </div>

        <div style={styles.detailsList}>
          <div style={styles.detailsItem}>
            <Store size={18} style={styles.icon} />
            <div style={styles.detailsText}>
              <span style={styles.label}>Business Category</span>
              <span style={styles.value}>{shop?.business_category}</span>
            </div>
          </div>

          <div style={styles.detailsItem}>
            <MapPin size={18} style={styles.icon} />
            <div style={styles.detailsText}>
              <span style={styles.label}>Address</span>
              <span style={styles.value}>
                {shop?.door_number ? `${shop.door_number}, ` : ''}
                {shop?.street ? `${shop.street}, ` : ''}
                {shop?.village_town}, {shop?.district}, {shop?.state} - {shop?.pin_code}
              </span>
            </div>
          </div>

          <div style={styles.detailsItem}>
            <Mail size={18} style={styles.icon} />
            <div style={styles.detailsText}>
              <span style={styles.label}>Contact & Preferences</span>
              <span style={styles.value}>
                UPI: {shop?.upi_id || 'Not Set'} | Currency: {shop?.currency}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.footerNote}>
          <p>Full edit profile controls will be available in subsequent phases.</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'var(--bg-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  } as React.CSSProperties,
  card: {
    maxWidth: '540px',
    width: '100%',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  } as React.CSSProperties,
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    transition: 'color var(--transition-fast)',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,
  logo: {
    width: '64px',
    height: '64px',
    borderRadius: 'var(--radius-sm)',
    objectFit: 'cover',
    border: '1px solid var(--border-color)',
  } as React.CSSProperties,
  logoPlaceholder: {
    width: '64px',
    height: '64px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  headerText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as React.CSSProperties,
  shopName: {
    fontSize: '1.5rem',
    fontWeight: '800',
  } as React.CSSProperties,
  shopCode: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'var(--border-color)',
  } as React.CSSProperties,
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  } as React.CSSProperties,
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'var(--success-light)',
    border: '1px solid var(--success)',
    borderRadius: 'var(--radius-sm)',
  } as React.CSSProperties,
  statusTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  } as React.CSSProperties,
  statusTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  statusDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  } as React.CSSProperties,
  detailsItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
  } as React.CSSProperties,
  icon: {
    color: 'var(--text-muted)',
    marginTop: '2px',
  } as React.CSSProperties,
  detailsText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  } as React.CSSProperties,
  label: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    textTransform: 'uppercase',
  } as React.CSSProperties,
  value: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  footerNote: {
    textAlign: 'center',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '8px',
  } as React.CSSProperties,
};
