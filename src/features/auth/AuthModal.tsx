import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { ShieldCheck, Phone, ArrowRight, RefreshCw, Zap, CheckCircle2, Lock } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login } = useAppStore();
  const [phone, setPhone] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['1', '2', '3', '4', '5', '6']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('otp');
      setTimer(30);
    }, 600);
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
      login(phone || '9876543210', ownerName || 'Jaswanth Kumar');
      setIsSubmitting(false);
    }, 600);
  };

  const handleQuickDemoLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      login('+91 98765 43210', 'Jaswanth Kumar (Store Owner)');
      setIsSubmitting(false);
    }, 400);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(8px)', zIndex: 9999 }}>
      <div style={{
        background: 'var(--bg-card)',
        width: '100%',
        maxWidth: '420px',
        borderRadius: '24px',
        border: '1px solid var(--border-light)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header Branding Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #059669, #047857)',
          padding: '28px 24px',
          color: 'white',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            backdropFilter: 'blur(4px)'
          }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 800 }}>Shop KhattaBook POS</h2>
          <p style={{ fontSize: '12px', opacity: 0.9, marginTop: 4 }}>
            Digital Ledger & Smart Billing for Indian Retailers
          </p>
        </div>

        {/* Body Form */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: 'var(--debt-50)',
              color: 'var(--debt-700)',
              border: '1px solid var(--debt-200)',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>⚠️ {error}</span>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6, display: 'block' }}>
                  Store Owner Full Name (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Jaswanth Kumar"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6, display: 'block' }}>
                  Mobile Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-muted)'
                  }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    className="input-field"
                    style={{ paddingLeft: '48px' }}
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                    required
                  />
                  <Phone size={16} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ marginTop: 6, padding: '12px', borderRadius: '12px', fontSize: '14px', justifyContent: 'center' }}
              >
                <span>{isSubmitting ? 'Sending OTP...' : 'Continue & Send OTP'}</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
              </div>

              <button
                type="button"
                onClick={handleQuickDemoLogin}
                style={{
                  background: 'var(--khatta-50)',
                  color: 'var(--khatta-700)',
                  border: '1px solid var(--khatta-200)',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer'
                }}
              >
                <Zap size={16} color="var(--khatta-600)" />
                <span>⚡ One-Tap Demo Quick Login</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Enter 6-digit verification code sent to</span>
                <div style={{ fontSize: '14px', fontWeight: 800, marginTop: 2 }}>+91 {phone}</div>
              </div>

              {/* OTP Digits */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '8px 0' }}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    style={{
                      width: '44px',
                      height: '50px',
                      textAlign: 'center',
                      fontSize: '20px',
                      fontWeight: 800,
                      borderRadius: '12px',
                      border: digit ? '2px solid var(--khatta-600)' : '1px solid var(--border-light)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      boxShadow: digit ? '0 2px 8px rgba(5, 150, 105, 0.2)' : 'none'
                    }}
                  />
                ))}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--khatta-700)', background: 'var(--khatta-50)', padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                💡 Demo OTP Pre-filled: <strong>1 2 3 4 5 6</strong>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ padding: '12px', borderRadius: '12px', fontSize: '14px', justifyContent: 'center' }}
              >
                <CheckCircle2 size={18} />
                <span>{isSubmitting ? 'Verifying OTP...' : 'Verify OTP & Access Store'}</span>
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Edit Phone
                </button>

                <button
                  type="button"
                  disabled={timer > 0}
                  onClick={() => { setTimer(30); setOtp(['1', '2', '3', '4', '5', '6']); }}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: timer > 0 ? 'var(--text-muted)' : 'var(--khatta-600)',
                    cursor: timer > 0 ? 'default' : 'pointer',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
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
          padding: '12px 24px',
          textAlign: 'center',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }}>
          <Lock size={12} />
          <span>256-Bit Encrypted Offline & Cloud Session Storage</span>
        </div>
      </div>
    </div>
  );
};
