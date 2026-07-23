import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { APP_NAME } from '@/constants/env';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft, BookOpen } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { resetPassword, error, clearError, loading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
    setFormError(null);
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }

    try {
      await resetPassword(email.trim());
      setSubmitted(true);
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

        {submitted ? (
          <div style={styles.successState} className="animate-fade-in">
            <div style={styles.successIconWrapper}>
              <CheckCircle2 size={40} style={{ color: 'var(--success)' }} />
            </div>
            <h2 style={styles.title}>Reset link sent!</h2>
            <p style={styles.subtitle}>
              We have sent a password recovery link to <strong>{email}</strong>. Please check your inbox.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              Back to Log In
            </Link>
          </div>
        ) : (
          <>
            <div style={styles.textHeader}>
              <h2 style={styles.title}>Reset Password</h2>
              <p style={styles.subtitle}>
                Enter your email address and we'll send you a recovery link.
              </p>
            </div>

            {(error || formError) && (
              <div style={styles.errorAlert}>
                <AlertCircle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem' }}>{formError || error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div className="input-group">
                <label className="input-label" htmlFor="forgot-email">Email Address</label>
                <div style={styles.inputWrapper}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    id="forgot-email"
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

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <Link to="/login" style={styles.backButton}>
              <ArrowLeft size={16} />
              Back to Log In
            </Link>
          </>
        )}
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
    lineHeight: '1.4',
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
  backButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    marginTop: '8px',
    transition: 'color var(--transition-fast)',
  } as React.CSSProperties,
  successState: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,
  successIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--success-light)',
    marginBottom: '8px',
  } as React.CSSProperties,
};
