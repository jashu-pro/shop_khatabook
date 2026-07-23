import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useShopQuery } from '@/features/shop/hooks/useShop';
import { Sparkles, Calendar } from 'lucide-react';

export const WelcomeCard: React.FC = () => {
  const { user } = useAuthStore();
  const { data: shop } = useShopQuery(user?.id);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const ownerName = shop?.owner_name || user?.user_metadata?.full_name || 'Owner';
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={styles.card} className="glass-panel animate-fade-in">
      <div style={styles.content}>
        <div style={styles.greetingRow}>
          <Sparkles size={20} style={{ color: '#fbbf24' }} />
          <h2 style={styles.greetingText}>
            {getGreeting()}, {ownerName} 👋
          </h2>
        </div>
        <p style={styles.welcomeText}>
          Welcome back to <strong>Shop KhattaBook</strong> control panel. Here is your business summary for today.
        </p>

        <div style={styles.shopDetails}>
          <span style={styles.shopMetaItem}>
            Store: <strong>{shop?.shop_name || 'N/A'}</strong>
          </span>
          <span style={styles.metaDivider}>•</span>
          <span style={styles.shopMetaItem}>
            ID: <strong>{shop?.shop_code || 'N/A'}</strong>
          </span>
        </div>
      </div>

      <div style={styles.dateBox}>
        <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
        <span style={styles.dateText}>{currentDate}</span>
      </div>
    </div>
  );
};

const styles = {
  card: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(99, 102, 241, 0.05) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    flexWrap: 'wrap',
    gap: '16px',
    width: '100%',
  } as React.CSSProperties,
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  } as React.CSSProperties,
  greetingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
  greetingText: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.01em',
  } as React.CSSProperties,
  welcomeText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  } as React.CSSProperties,
  shopDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
  } as React.CSSProperties,
  shopMetaItem: {
    fontSize: '0.8rem',
  } as React.CSSProperties,
  metaDivider: {
    color: 'var(--text-muted)',
    opacity: 0.5,
  } as React.CSSProperties,
  dateBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    boxShadow: 'var(--shadow-sm)',
  } as React.CSSProperties,
  dateText: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
};
