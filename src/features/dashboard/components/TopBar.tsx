import React from 'react';
import { Bell, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useShopQuery } from '@/features/shop/hooks/useShop';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export const TopBar: React.FC = () => {
  const { user } = useAuthStore();
  const { data: shop } = useShopQuery(user?.id);

  // Fallback initial
  const ownerName = shop?.owner_name || user?.user_metadata?.full_name || 'Owner';
  const ownerInitial = ownerName.charAt(0).toUpperCase();

  return (
    <header style={styles.topbar} className="glass-panel">
      <div style={styles.left}>
        <span style={styles.shopLabel}>Active Shop:</span>
        <span style={styles.shopName}>{shop?.shop_name || 'Credora Ledger'}</span>
      </div>

      <div style={styles.right}>
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Icon */}
        <div style={styles.iconWrapper} title="Notifications">
          <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
          <span style={styles.badge} />
        </div>

        <div style={styles.divider} />

        {/* User Info & Avatar */}
        <div style={styles.userProfile}>
          <div style={styles.userDetails}>
            <span style={styles.userName}>{ownerName}</span>
            <span style={styles.userRole}>Store Administrator</span>
          </div>

          {shop?.owner_photo_url ? (
            <img src={shop.owner_photo_url} alt="Owner Avatar" style={styles.avatar} />
          ) : (
            <div style={styles.avatarPlaceholder} title={ownerName}>
              <span>{ownerInitial}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const styles = {
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    borderRadius: 'var(--radius-md)',
    width: '100%',
    height: '64px',
  } as React.CSSProperties,
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
  shopLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  } as React.CSSProperties,
  shopName: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  } as React.CSSProperties,
  iconWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'background-color var(--transition-fast)',
  } as React.CSSProperties,
  badge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    border: '2px solid var(--bg-secondary)',
  } as React.CSSProperties,
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: 'var(--border-color)',
  } as React.CSSProperties,
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  } as React.CSSProperties,
  userName: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  userRole: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  } as React.CSSProperties,
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid var(--border-color)',
  } as React.CSSProperties,
  avatarPlaceholder: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    border: '1px solid var(--border-color)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.95rem',
    fontWeight: '700',
  } as React.CSSProperties,
};
