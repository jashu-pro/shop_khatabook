import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFade(true), 1200);
    const timer2 = setTimeout(() => onFinish(), 1500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #064e3b 100%)',
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      opacity: fade ? 0 : 1,
      transition: 'opacity 0.3s ease-out',
      pointerEvents: fade ? 'none' : 'auto'
    }}>
      <div style={{
        width: '88px',
        height: '88px',
        borderRadius: '26px',
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        marginBottom: 20,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        animation: 'pulse 1.5s infinite ease-in-out'
      }}>
        <ShieldCheck size={48} color="white" />
      </div>

      <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 900, letterSpacing: '-0.5px' }}>
        Shop KhattaBook POS
      </h1>
      <p style={{ fontSize: '13px', opacity: 0.9, marginTop: 6, fontWeight: 500 }}>
        Smart Credit Ledger, Inventory & Billing Engine
      </p>

      {/* Loading Spinner & Status */}
      <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(255,255,255,0.3)',
          borderTopColor: 'white',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', opacity: 0.8 }}>
          INITIALIZING SECURE SESSION...
        </span>
      </div>

      {/* Footer Tag */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        fontSize: '11px',
        opacity: 0.7,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        <Sparkles size={12} />
        <span>v2.5 Pro • Powered by Credora POS SaaS</span>
      </div>
    </div>
  );
};
