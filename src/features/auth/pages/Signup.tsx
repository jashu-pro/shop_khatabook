import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { APP_NAME } from '@/constants/env';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { User, Mail, Lock, Phone, Eye, EyeOff, Loader2, AlertCircle, BookOpen, Camera } from 'lucide-react';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, error, clearError, loading, user } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Clean errors
  useEffect(() => {
    clearError();
    setFormError(null);
    return () => {
      clearError();
    };
  }, [clearError]);

  // If already logged in, redirect to onboarding dashboard
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      await signUp(email.trim(), password, fullName.trim(), phone.trim(), avatarUrl.trim());
      navigate('/', { replace: true });
    } catch (err: any) {
      // Handled by store
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.themeTogglePosition}>
        <ThemeToggle />
      </div>

      <div style={styles.card} className="glass-panel animate-fade-in">
        {/* App Logo */}
        <div style={styles.logoHeader}>
          <div style={styles.logoIcon}>
            <BookOpen size={24} style={{ color: '#ffffff' }} />
          </div>
          <span style={styles.logoText}>{APP_NAME}</span>
        </div>

        <div style={styles.textHeader}>
          <h2 style={styles.title}>Register your shop</h2>
          <p style={styles.subtitle}>Create an owner account to set up your ledger</p>
        </div>

        {/* Global Errors */}
        {(error || formError) && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem' }}>{formError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="input-group">
            <label className="input-label" htmlFor="signup-fullname">Full Name *</label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                id="signup-fullname"
                type="text"
                placeholder="Ramesh Kumar"
                className="input-field"
                style={{ paddingLeft: '44px' }}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="signup-phone">Mobile Number</label>
            <div style={styles.inputWrapper}>
              <Phone size={18} style={styles.inputIcon} />
              <input
                id="signup-phone"
                type="tel"
                placeholder="+91 9876543210"
                className="input-field"
                style={{ paddingLeft: '44px' }}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="signup-avatar">Avatar Image URL</label>
            <div style={styles.inputWrapper}>
              <Camera size={18} style={styles.inputIcon} />
              <input
                id="signup-avatar"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                className="input-field"
                style={{ paddingLeft: '44px', paddingRight: avatarUrl.trim() ? '50px' : '16px' }}
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                disabled={loading}
              />
              {avatarUrl.trim() && (
                <img 
                  src={avatarUrl.trim()} 
                  alt="Avatar Preview" 
                  style={{
                    position: 'absolute',
                    right: '12px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid var(--border-color)',
                  }}
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              )}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="signup-email">Email Address *</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                id="signup-email"
                type="email"
                placeholder="owner@example.com"
                className="input-field"
                style={{ paddingLeft: '44px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="signup-password">Password *</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                className="input-field"
                style={{ paddingLeft: '44px', paddingRight: '44px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="signup-confirm-password">Confirm Password *</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                id="signup-confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                className="input-field"
                style={{ paddingLeft: '44px' }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.loginLink}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '24px',
    backgroundColor: 'var(--bg-primary)',
    position: 'relative',
  } as React.CSSProperties,
  themeTogglePosition: {
    position: 'absolute',
    top: '24px',
    right: '24px',
  } as React.CSSProperties,
  card: {
    maxWidth: '460px',
    width: '100%',
    padding: '40px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  } as React.CSSProperties,
  logoHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  } as React.CSSProperties,
  logoIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
  } as React.CSSProperties,
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '800',
    letterSpacing: '-0.025em',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  textHeader: {
    textAlign: 'center',
  } as React.CSSProperties,
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '6px',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--danger-light)',
    border: '1px solid var(--danger)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 16px',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
  } as React.CSSProperties,
  footerText: {
    fontSize: '0.875rem',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    marginTop: '8px',
  } as React.CSSProperties,
  loginLink: {
    fontWeight: '600',
    color: 'var(--primary)',
  } as React.CSSProperties,
};
