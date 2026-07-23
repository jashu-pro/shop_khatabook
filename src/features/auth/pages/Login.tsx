import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { APP_NAME } from '@/constants/env';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, error, clearError, loading, user } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Clear errors on mount/unmount
  useEffect(() => {
    clearError();
    setFormError(null);
    return () => {
      clearError();
    };
  }, [clearError]);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email.trim() || !password.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }

    try {
      await signIn(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err: any) {
      // Handled by store, error is set in authStore
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    clearError();
    try {
      await signInWithGoogle();
    } catch (err: any) {
      // Handled by store
    }
  };

  return (
    <div style={styles.container}>
      {/* Top right theme controls */}
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
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Securely log in to manage your digital ledger</p>
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
            <label className="input-label" htmlFor="login-email">Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                id="login-email"
                type="email"
                placeholder="owner@example.com"
                className="input-field"
                style={{ paddingLeft: '44px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <div style={styles.passwordLabelRow}>
              <label className="input-label" htmlFor="login-password">Password</label>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
            </div>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="input-field"
                style={{ paddingLeft: '44px', paddingRight: '44px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
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

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <div style={styles.dividerRow}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or continue with</span>
          <div style={styles.dividerLine} />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="btn btn-google"
          style={styles.googleButton}
          disabled={loading}
        >
          <FcGoogle size={20} />
          Sign in with Google
        </button>

        <p style={styles.footerText}>
          Don't have a shop account? <Link to="/signup" style={styles.signupLink}>Create one</Link>
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
    maxWidth: '440px',
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
    gap: '18px',
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
  passwordLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  forgotLink: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--primary)',
  } as React.CSSProperties,
  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    margin: '8px 0 0 0',
  } as React.CSSProperties,
  dividerLine: {
    flexGrow: 1,
    height: '1px',
    backgroundColor: 'var(--border-color)',
  } as React.CSSProperties,
  dividerText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
    textTransform: 'uppercase',
  } as React.CSSProperties,
  googleButton: {
    width: '100%',
  } as React.CSSProperties,
  footerText: {
    fontSize: '0.875rem',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    marginTop: '8px',
  } as React.CSSProperties,
  signupLink: {
    fontWeight: '600',
    color: 'var(--primary)',
  } as React.CSSProperties,
};
