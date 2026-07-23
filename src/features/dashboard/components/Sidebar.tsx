import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useShopQuery } from '@/features/shop/hooks/useShop';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  CircleDollarSign, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  Store
} from 'lucide-react';

interface SidebarProps {
  onComingSoonAlert?: (feature: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onComingSoonAlert }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const { data: shop } = useShopQuery(user?.id);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { id: 'customers', label: 'Customers', icon: <Users size={20} />, path: '/customers', future: true },
    { id: 'sales', label: 'Sales Feed', icon: <ShoppingBag size={20} />, path: '/sales', future: true },
    { id: 'payments', label: 'Payments', icon: <CircleDollarSign size={20} />, path: '/payments', future: true },
    { id: 'ledger', label: 'Digital Ledger', icon: <BookOpen size={20} />, path: '/ledger', future: true },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} />, path: '/reports', future: true },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, path: '/shop-profile' },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.future) {
      if (onComingSoonAlert) {
        onComingSoonAlert(item.label);
      } else {
        alert(`${item.label} module is coming soon in future development phases!`);
      }
    } else {
      navigate(item.path);
    }
  };

  return (
    <aside style={styles.sidebar} className="glass-panel">
      {/* Brand Header */}
      <div style={styles.brand}>
        <div style={styles.brandIcon}>
          <Store size={18} style={{ color: '#ffffff' }} />
        </div>
        <span style={styles.brandName}>Credora Ledger</span>
      </div>

      <div style={styles.divider} />

      {/* Shop Info Summary */}
      <div style={styles.shopCard}>
        {shop?.shop_logo_url ? (
          <img src={shop.shop_logo_url} alt="Shop Logo" style={styles.shopLogo} />
        ) : (
          <div style={styles.shopLogoPlaceholder}>
            <Store size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
        <div style={styles.shopText}>
          <span style={styles.shopNameText}>{shop?.shop_name || 'Loading Shop...'}</span>
          <span style={styles.shopCodeText}>Code: {shop?.shop_code || '---'}</span>
        </div>
      </div>

      <div style={{ ...styles.divider, margin: '8px 0 16px 0' }} />

      {/* Navigation List */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              style={{
                ...styles.navItem,
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              }}
              className="sidebar-link"
            >
              <span style={{
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
              }}>
                {item.icon}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: isActive ? '700' : '600' }}>
                {item.label}
              </span>
              {item.future && (
                <span style={styles.comingSoonTag}>Soon</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Action */}
      <div style={styles.footer}>
        <button onClick={handleLogout} style={styles.logoutBtn} className="btn btn-outline">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    height: 'calc(100vh - 32px)',
    position: 'sticky',
    top: '16px',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    zIndex: 100,
    flexShrink: 0,
  } as React.CSSProperties,
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '4px 8px',
  } as React.CSSProperties,
  brandIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
  } as React.CSSProperties,
  brandName: {
    fontWeight: '800',
    fontSize: '1.1rem',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  } as React.CSSProperties,
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '16px 0',
  } as React.CSSProperties,
  shopCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  } as React.CSSProperties,
  shopLogo: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-xs)',
    objectFit: 'cover',
    border: '1px solid var(--border-color)',
  } as React.CSSProperties,
  shopLogoPlaceholder: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-xs)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  shopText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    overflow: 'hidden',
  } as React.CSSProperties,
  shopNameText: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,
  shopCodeText: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  } as React.CSSProperties,
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flexGrow: 1,
  } as React.CSSProperties,
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all var(--transition-fast)',
    width: '100%',
    position: 'relative',
  } as React.CSSProperties,
  comingSoonTag: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.6rem',
    fontWeight: '700',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    padding: '2px 6px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-color)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  } as React.CSSProperties,
  footer: {
    marginTop: 'auto',
    width: '100%',
  } as React.CSSProperties,
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 0',
  } as React.CSSProperties,
};
