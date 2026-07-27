import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { ShieldCheck, Phone, ArrowRight, RefreshCw, Zap, CheckCircle2, Lock } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login, signup, loginWithGoogle, forgotPasswordReset } = useAppStore();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form Fields
  const [phone, setPhone] = useState('9876543210');
  const [ownerName, setOwnerName] = useState('Jaswanth Kumar');
  const [email] = useState('owner@srilaxmitraders.com');
  const [shopName, setShopName] = useState('Sri Laxmi Traders');
  const [category, setCategory] = useState('Kirana & General Store');
  const [newPin, setNewPin] = useState('1234');

  // OTP State
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (mode === 'signup') {
      if (!ownerName || !shopName) {
        setError('Please enter full owner name and shop name');
        return;
      }

      // Duplicate Email / Phone Checking
      if (email.toLowerCase() === 'owner@srilaxmitraders.com' || cleanPhone === '9876543210') {
        setError(`Duplicate Account Warning: An account with email "${email}" or phone "${phone}" already exists! Please click "Sign In" instead.`);
        return;
      }
    }

    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setStep('otp');
      setTimer(30);
    }, 500);
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      if (mode === 'login') {
        login(phone, ownerName);
      } else if (mode === 'signup') {
        signup({ fullName: ownerName, phone, email, shopName, category });
      } else if (mode === 'forgot') {
        forgotPasswordReset(phone, newPin);
        setSuccessMsg('Security PIN reset successfully to ' + newPin + '! Logged in.');
        setTimeout(() => login(phone, ownerName), 800);
      }
      setIsSubmitting(false);
    }, 600);
  };

  const handleGoogleSignIn = (isFirstLogin: boolean = false) => {
    setIsSubmitting(true);
    setTimeout(() => {
      loginWithGoogle(isFirstLogin);
      setIsSubmitting(false);
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      login('+91 98765 43210', 'Jaswanth Kumar (Store Owner)');
      setIsSubmitting(false);
    }, 300);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (val && index < 5) {
      const nextInput = document.getElementById(`auth-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(10px)', zIndex: 99999 }}>
      <div style={{
        background: 'var(--bg-card)',
        width: '100%',
        maxWidth: '440px',
        borderRadius: '24px',
        border: '1px solid var(--border-light)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Top Header Branding Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          padding: '24px 20px',
          color: 'white',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto',
            backdropFilter: 'blur(4px)'
          }}>
            <ShieldCheck size={30} color="white" />
          </div>
          <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 800 }}>Shop KhattaBook POS</h2>
          <p style={{ fontSize: '11px', opacity: 0.9, marginTop: 2 }}>
            {mode === 'login' ? 'Welcome Back! Sign in to your Store Account' :
             mode === 'signup' ? 'Create New Merchant Store Account' :
             'Reset Security Password or 4-Digit PIN'}
          </p>
        </div>

        {/* Auth Mode Tabs */}
        {step === 'form' && (
          <div style={{ display: 'flex', background: 'var(--border-subtle)', padding: '4px', borderBottom: '1px solid var(--border-light)' }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                background: mode === 'login' ? 'var(--bg-card)' : 'transparent',
                color: mode === 'login' ? 'var(--khatta-700)' : 'var(--text-muted)',
                boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                background: mode === 'signup' ? 'var(--bg-card)' : 'transparent',
                color: mode === 'signup' ? 'var(--khatta-700)' : 'var(--text-muted)',
                boxShadow: mode === 'signup' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              Create Account
            </button>

            <button
              type="button"
              onClick={() => { setMode('forgot'); setError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                background: mode === 'forgot' ? 'var(--bg-card)' : 'transparent',
                color: mode === 'forgot' ? 'var(--khatta-700)' : 'var(--text-muted)',
                boxShadow: mode === 'forgot' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              Forgot PIN
            </button>
          </div>
        )}

        {/* Body Content */}
        <div style={{ padding: '20px 24px' }}>
          {error && (
            <div style={{ background: 'var(--debt-50)', color: 'var(--debt-700)', border: '1px solid var(--debt-200)', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, marginBottom: 14 }}>
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div style={{ background: 'var(--khatta-50)', color: 'var(--khatta-700)', border: '1px solid var(--khatta-200)', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, marginBottom: 14 }}>
              ✅ {successMsg}
            </div>
          )}

          {step === 'form' ? (
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mode === 'signup' && (
                <>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4, display: 'block' }}>Owner Full Name *</label>
                    <input type="text" className="input-field" placeholder="e.g. Jaswanth Kumar" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4, display: 'block' }}>Shop Business Name *</label>
                    <input type="text" className="input-field" placeholder="e.g. Sri Laxmi Traders" value={shopName} onChange={(e) => setShopName(e.target.value)} required />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4, display: 'block' }}>Business Category</label>
                    <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Kirana & General Store">Kirana & General Store</option>
                      <option value="Supermarket & Provisions">Supermarket & Provisions</option>
                      <option value="Clothing & Apparel">Clothing & Apparel</option>
                      <option value="Electronics & Mobiles">Electronics & Mobiles</option>
                      <option value="Pharmacy & Medicals">Pharmacy & Medicals</option>
                    </select>
                  </div>
                </>
              )}

              {mode === 'forgot' && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4, display: 'block' }}>New 4-Digit Security PIN *</label>
                  <input type="text" maxLength={4} className="input-field" placeholder="e.g. 1234" value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} required />
                </div>
              )}

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, marginBottom: 4, display: 'block' }}>Mobile Number *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>+91</span>
                  <input type="tel" className="input-field" style={{ paddingLeft: '48px' }} placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10} required />
                  <Phone size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: 4, padding: '11px', borderRadius: '12px', fontSize: '13px', justifyContent: 'center' }}>
                <span>{isSubmitting ? 'Sending OTP...' : mode === 'login' ? 'Continue with OTP' : mode === 'signup' ? 'Verify & Create Shop' : 'Send PIN Reset OTP'}</span>
                <ArrowRight size={16} />
              </button>

              {/* Social OAuth Google Sign-In */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>OR SIGN IN WITH GMAIL</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn(false)}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-main)',
                    padding: '10px',
                    borderRadius: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign In with Existing Google Account</span>
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleGoogleSignIn(true)}
                    style={{
                      background: 'var(--border-subtle)',
                      border: '1px solid var(--border-light)',
                      color: 'var(--text-main)',
                      padding: '8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Google First Login (New User)
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    style={{
                      background: 'var(--khatta-50)',
                      color: 'var(--khatta-700)',
                      border: '1px solid var(--khatta-200)',
                      padding: '8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      cursor: 'pointer'
                    }}
                  >
                    <Zap size={13} color="var(--khatta-600)" />
                    <span>⚡ One-Tap Demo</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Enter 6-digit verification code sent to</span>
                <div style={{ fontSize: '14px', fontWeight: 800, marginTop: 2 }}>+91 {phone}</div>
              </div>

              {/* OTP Input Fields */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, margin: '4px 0' }}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`auth-otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    style={{
                      width: '42px',
                      height: '48px',
                      textAlign: 'center',
                      fontSize: '18px',
                      fontWeight: 800,
                      borderRadius: '10px',
                      border: digit ? '2px solid var(--khatta-600)' : '1px solid var(--border-light)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)'
                    }}
                  />
                ))}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--khatta-700)', background: 'var(--khatta-50)', padding: '6px', borderRadius: '8px', textAlign: 'center' }}>
                💡 Demo OTP Pre-filled: <strong>1 2 3 4 5 6</strong>
              </div>

              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ padding: '11px', borderRadius: '12px', fontSize: '13px', justifyContent: 'center' }}>
                <CheckCircle2 size={16} />
                <span>{isSubmitting ? 'Verifying...' : 'Verify OTP & Authorize'}</span>
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                <button type="button" onClick={() => setStep('form')} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
                  ← Back to Form
                </button>

                <button type="button" disabled={timer > 0} onClick={() => { setTimer(30); setOtp(['1', '2', '3', '4', '5', '6']); }} style={{ border: 'none', background: 'none', color: timer > 0 ? 'var(--text-muted)' : 'var(--khatta-600)', cursor: timer > 0 ? 'default' : 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <RefreshCw size={12} className={timer > 0 ? '' : 'spin'} />
                  {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP Now'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Footer */}
        <div style={{
          background: 'var(--border-subtle)',
          padding: '10px 20px',
          textAlign: 'center',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }}>
          <Lock size={12} />
          <span>Secure JWT OAuth Session & Token Persistence Active</span>
        </div>
      </div>
    </div>
  );
};
