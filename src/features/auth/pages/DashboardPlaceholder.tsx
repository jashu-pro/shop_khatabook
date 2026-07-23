import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { APP_NAME, APP_VERSION } from '@/constants/env';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LogOut, CheckCircle2, ChevronRight, Store, User, Mail, ShieldAlert } from 'lucide-react';

export const DashboardPlaceholder: React.FC = () => {
  const { user, signOut, loading } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleNextStep = () => {
    alert('Congratulations! Phase 1 – Authentication & Foundation is complete. Phase 2 – Shop Registration is up next!');
  };

  // Extract metadata safely
  const fullName = user?.user_metadata?.full_name || 'Shop Owner';
  const phoneNumber = user?.user_metadata?.phone_number || 'Not Provided';

  return (
    <div style={styles.container}>
      {/* Upper Navigation Header */}
      <header style={styles.header} className="glass-panel">
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>
            <Store size={18} style={{ color: '#ffffff' }} />
          </div>
          <span style={styles.headerAppName}>{APP_NAME}</span>
        </div>
        
        <div style={styles.headerRight}>
          <ThemeToggle />
          <button 
            onClick={handleLogout} 
            className="btn btn-outline" 
            style={styles.logoutButton}
            disabled={loading}
          >
            <LogOut size={16} />
            <span style={styles.logoutText}>Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={styles.main}>
        <div style={styles.heroCard} className="glass-panel animate-fade-in">
          <div style={styles.badgeWrapper}>
            <div style={styles.successBadge}>
              <CheckCircle2 size={32} style={{ color: 'var(--success)' }} />
            </div>
          </div>
          
          <h1 style={styles.heroTitle}>🎉 Authentication Successful</h1>
          <p style={styles.heroSubtitle}>Welcome to your new digital ledger book dashboard!</p>
          
          <div style={styles.divider} />
          
          <div style={styles.phaseCard}>
            <div style={styles.phaseText}>
              <span style={styles.phaseLabel}>CURRENT PROGRESS</span>
              <h3 style={styles.phaseValue}>Phase 1 Completed</h3>
              <p style={styles.phaseDesc}>Secure session management and profiles setup is fully verified.</p>
            </div>
            <div style={styles.versionBadge}>v{APP_VERSION}</div>
          </div>

          <div style={styles.sessionDetails}>
            <h4 style={styles.detailsTitle}>User Account Details</h4>
            
            <div style={styles.detailsGrid}>
              <div style={styles.detailsItem}>
                <User size={16} style={styles.detailsIcon} />
                <div style={styles.detailsTextGroup}>
                  <span style={styles.detailsLabel}>Full Name</span>
                  <span style={styles.detailsValue}>{fullName}</span>
                </div>
              </div>

              <div style={styles.detailsItem}>
                <Mail size={16} style={styles.detailsIcon} />
                <div style={styles.detailsTextGroup}>
                  <span style={styles.detailsLabel}>Email Address</span>
                  <span style={styles.detailsValue}>{user?.email}</span>
                </div>
              </div>

              <div style={styles.detailsItem}>
                <ShieldAlert size={16} style={styles.detailsIcon} />
                <div style={styles.detailsTextGroup}>
                  <span style={styles.detailsLabel}>Mobile Number</span>
                  <span style={styles.detailsValue}>{phoneNumber}</span>
                </div>
              </div>

              <div style={styles.detailsItem}>
                <ShieldAlert size={16} style={styles.detailsIcon} />
                <div style={styles.detailsTextGroup}>
                  <span style={styles.detailsLabel}>User Unique ID</span>
                  <span style={styles.detailsValue} title={user?.id}>
                    {user?.id ? `${user.id.slice(0, 8)}...${user.id.slice(-8)}` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleNextStep} 
            className="btn btn-primary" 
            style={styles.nextStepButton}
          >
            <span>Next Step: Register Your Shop</span>
            <ChevronRight size={18} />
          </button>
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
    letterSpacing: '-0.01em',
  } as React.CSSProperties,
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,
  logoutButton: {
    padding: '8px 16px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  } as React.CSSProperties,
  logoutText: {
    display: 'inline-block',
  } as React.CSSProperties,
  main: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
  } as React.CSSProperties,
  heroCard: {
    maxWidth: '560px',
    width: '100%',
    padding: '40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  } as React.CSSProperties,
  badgeWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '72px',
    height: '72px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--success-light)',
    marginBottom: '8px',
  } as React.CSSProperties,
  successBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  heroTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    lineHeight: '1.2',
  } as React.CSSProperties,
  heroSubtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  } as React.CSSProperties,
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'var(--border-color)',
  } as React.CSSProperties,
  phaseCard: {
    width: '100%',
    padding: '16px 20px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'left',
  } as React.CSSProperties,
  phaseText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as React.CSSProperties,
  phaseLabel: {
    fontSize: '0.65rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    color: 'var(--primary)',
  } as React.CSSProperties,
  phaseValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  phaseDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  versionBadge: {
    padding: '4px 10px',
    fontSize: '0.75rem',
    fontWeight: '700',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    borderRadius: 'var(--radius-full)',
  } as React.CSSProperties,
  sessionDetails: {
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  } as React.CSSProperties,
  detailsTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  } as React.CSSProperties,
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
  } as React.CSSProperties,
  detailsItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
  } as React.CSSProperties,
  detailsIcon: {
    color: 'var(--text-muted)',
    flexShrink: 0,
  } as React.CSSProperties,
  detailsTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  } as React.CSSProperties,
  detailsLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  } as React.CSSProperties,
  detailsValue: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,
  nextStepButton: {
    width: '100%',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '8px',
  } as React.CSSProperties,
};
