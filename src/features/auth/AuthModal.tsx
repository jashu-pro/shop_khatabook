import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { Mail, Lock, Eye, EyeOff, User, Phone, Key, ArrowRight, BookOpen } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login, signup, loginWithGoogle, forgotPasswordReset } = useAppStore();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Form Fields
  const [email, setEmail] = useState('jaswanthmajji43@gmail.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Jaswanth Majji');
  const [mobile, setMobile] = useState('9848012345');
  const [newPin, setNewPin] = useState('1234');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setIsSubmitting(true);
    setTimeout(() => {
      login(mobile || '9848012345', fullName || 'Jaswanth Majji');
      setIsSubmitting(false);
    }, 500);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !mobile || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (email.toLowerCase() === 'owner@srilaxmitraders.com' || mobile === '9876543210') {
      setError(`An account with email "${email}" or mobile "${mobile}" already exists! Please Sign In instead.`);
      return;
    }
    setError('');
    setIsSubmitting(true);
    setTimeout(() => {
      // Triggers signup & transitions to Shop Registration
      signup({
        fullName,
        phone: mobile,
        email,
        shopName: '', // empty to trigger Shop Registration wizard
        category: 'Kirana / Grocery Store'
      });
      setIsSubmitting(false);
    }, 600);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address');
      return;
    }
    setError('');
    setIsSubmitting(true);
    setTimeout(() => {
      forgotPasswordReset(email, newPin);
      setSuccessMsg(`PIN reset link sent to ${email}! Password reset to default PIN (${newPin}).`);
      setIsSubmitting(false);
    }, 600);
  };

  const handleGoogleAuth = (isNewUser: boolean = false) => {
    setIsSubmitting(true);
    setTimeout(() => {
      loginWithGoogle(isNewUser);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#FFFFFF',
        width: '100%',
        maxWidth: '460px',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #F1F5F9',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {mode === 'login' && (
          <div style={{ padding: '36px 32px 28px 32px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h1 style={{ color: '#0F172A', fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
                Welcome back
              </h1>
              <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
                Enter your credentials to access your shop dashboard
              </p>
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              onClick={() => handleGoogleAuth(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#1E293B',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                marginBottom: '22px',
                transition: 'all 0.2s'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>or email</span>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#F0F5FF',
                    color: '#0F172A',
                    fontSize: '13px',
                    outline: 'none',
                    fontWeight: 500
                  }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 48px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#F0F5FF',
                    color: '#0F172A',
                    fontSize: '13px',
                    outline: 'none',
                    fontWeight: 500
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Remember me & Forgot Password */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: '2px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#64748B', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ borderRadius: '4px', accentColor: '#007A55' }}
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  style={{ border: 'none', background: 'none', color: '#007A55', fontWeight: 700, cursor: 'pointer' }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#047857',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  marginTop: '8px',
                  boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)'
                }}
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Login to Dashboard'}</span>
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748B' }}>
              <span>Don't have an account? </span>
              <button
                type="button"
                onClick={() => setMode('signup')}
                style={{ border: 'none', background: 'none', color: '#007A55', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign Up
              </button>
            </div>

            {/* Legal */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px', fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
              <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
              <span>·</span>
              <span style={{ cursor: 'pointer' }}>Terms of Service</span>
              <span>·</span>
              <span style={{ cursor: 'pointer' }}>Support</span>
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <div style={{ padding: '32px 32px 24px 32px', textAlign: 'center' }}>
              {/* Icon */}
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <BookOpen size={24} />
              </div>
              <h1 style={{ color: '#0F172A', fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>
                Create Account
              </h1>
              <p style={{ color: '#64748B', fontSize: '12px', margin: 0 }}>
                Get started with your smart digital ledger
              </p>
            </div>

            <div style={{ padding: '0 32px 32px 32px' }}>
              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>
                    FULL NAME
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jaswanth Majji"
                      required
                      style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: 'none', background: '#F0F5FF', color: '#0F172A', fontSize: '13px', outline: 'none', fontWeight: 500 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>
                    MOBILE NUMBER
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9848012345"
                      required
                      style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: 'none', background: '#F0F5FF', color: '#0F172A', fontSize: '13px', outline: 'none', fontWeight: 500 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>
                    EMAIL ADDRESS
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jaswanthmajji43@gmail.com"
                      required
                      style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: 'none', background: '#F0F5FF', color: '#0F172A', fontSize: '13px', outline: 'none', fontWeight: 500 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', display: 'block' }}>
                    PASSWORD
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Key size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: 'none', background: '#F0F5FF', color: '#0F172A', fontSize: '13px', outline: 'none', fontWeight: 500 }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #00B29A 0%, #4F46E5 100%)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    marginTop: '6px'
                  }}
                >
                  <span>{isSubmitting ? 'Registering...' : 'Register & Set Up Shop'}</span>
                  <ArrowRight size={18} />
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '6px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                  <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 700 }}>OR CONTINUE WITH</span>
                  <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                </div>

                {/* Google Button */}
                <button
                  type="button"
                  onClick={() => handleGoogleAuth(true)}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    color: '#1E293B',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </form>
            </div>

            {/* Footer */}
            <div style={{ background: '#F8FAFC', padding: '16px', textAlign: 'center', fontSize: '13px', color: '#64748B', borderTop: '1px solid #F1F5F9' }}>
              <span>Already have an account? </span>
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{ border: 'none', background: 'none', color: '#00B29A', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {mode === 'forgot' && (
          <div style={{ padding: '32px 32px 28px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{ color: '#0F172A', fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>
                Reset Password / PIN
              </h1>
              <p style={{ color: '#64748B', fontSize: '12px', margin: 0 }}>
                Enter your email address to receive reset instructions
              </p>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#B91C1C', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {successMsg && (
              <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', marginBottom: '16px' }}>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  REGISTERED EMAIL ADDRESS
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jaswanthmajji43@gmail.com"
                    required
                    style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: 'none', background: '#F0F5FF', color: '#0F172A', fontSize: '13px', outline: 'none', fontWeight: 500 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  NEW 4-DIGIT PIN
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: 'none', background: '#F0F5FF', color: '#0F172A', fontSize: '13px', outline: 'none', fontWeight: 500 }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#047857',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <span>{isSubmitting ? 'Sending Link...' : 'Send Reset Link'}</span>
                <ArrowRight size={18} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{ border: 'none', background: 'none', color: '#64748B', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
