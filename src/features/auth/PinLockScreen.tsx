import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { Store, Delete } from 'lucide-react';

export const PinLockScreen: React.FC = () => {
  const { shop, user, unlockApp } = useAppStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError('');

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const verifyPin = (inputPin: string) => {
    const success = unlockApp(inputPin);
    if (!success) {
      setError('Incorrect Security PIN');
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 500);
    }
  };

  return (
    <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.94)', backdropFilter: 'blur(12px)', zIndex: 99999 }}>
      <div style={{
        width: '100%',
        maxWidth: '360px',
        textAlign: 'center',
        color: 'white',
        padding: '24px',
        transform: isShaking ? 'translateX(-10px)' : 'none',
        transition: 'transform 0.1s ease'
      }}>
        {/* Avatar & Shop Name */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #059669, #047857)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          fontSize: '32px',
          fontWeight: 800,
          boxShadow: '0 8px 24px rgba(5, 150, 105, 0.4)'
        }}>
          {shop?.name ? shop.name.charAt(0) : <Store size={36} />}
        </div>

        <h2 style={{ color: 'white', fontSize: '20px', fontWeight: 800 }}>{shop?.name || 'Shop KhattaBook'}</h2>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
          {user?.full_name || 'Store Owner'} • Enter 4-Digit Security PIN
        </p>

        {/* PIN Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 16,
          margin: '28px 0 16px 0'
        }}>
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.4)',
                background: idx < pin.length ? '#10b981' : 'transparent',
                boxShadow: idx < pin.length ? '0 0 12px #10b981' : 'none',
                transition: 'all 0.15s ease'
              }}
            />
          ))}
        </div>

        {/* Error Notification */}
        {error ? (
          <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 700, marginBottom: 12 }}>
            ⚠️ {error}
          </div>
        ) : (
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginBottom: 12 }}>
            Default PIN: <strong style={{ color: '#10b981' }}>1234</strong>
          </div>
        )}

        {/* Keypad Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          maxWidth: '280px',
          margin: '0 auto'
        }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              style={{
                height: '60px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'white',
                fontSize: '22px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.1s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {num}
            </button>
          ))}

          <button
            onClick={handleClear}
            style={{
              height: '60px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Clear
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            style={{
              height: '60px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'white',
              fontSize: '22px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            0
          </button>

          <button
            onClick={handleDelete}
            style={{
              height: '60px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Delete size={22} />
          </button>
        </div>

        <button
          onClick={() => verifyPin('1234')}
          style={{
            marginTop: '24px',
            border: 'none',
            background: 'none',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '12px',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Unlock with Default PIN (1234)
        </button>
      </div>
    </div>
  );
};
