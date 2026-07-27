import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { Sun, Moon, Wifi, WifiOff, Store, Sparkles, Lock } from 'lucide-react';

export const HeaderBar: React.FC = () => {
  const { shop, theme, toggleTheme, isOnline, toggleNetworkStatus, setActiveTab, isPinEnabled, lockApp } = useAppStore();

  const statusBg = isOnline ? 'var(--khatta-50)' : 'var(--debt-50)';
  const statusColor = isOnline ? 'var(--khatta-600)' : 'var(--debt-600)';

  return (
    <header className="top-header">
      <div className="shop-badge" onClick={() => setActiveTab('settings')} style={{ cursor: 'pointer' }}>
        <div className="shop-avatar">
          {shop?.name ? shop.name.charAt(0) : 'S'}
        </div>
        <div>
          <h2 className="shop-name">{shop?.name || 'Sri Laxmi Traders'}</h2>
          <p className="shop-sub">
            <Store size={10} style={{ display: 'inline', marginRight: 4 }} />
            {shop?.village_town}, {shop?.district}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button 
          onClick={toggleNetworkStatus} 
          title={isOnline ? "Online - Synced with Supabase Cloud" : "Offline - Savings queued in Local Storage"}
          style={{
            background: statusBg,
            color: statusColor,
            border: 'none',
            padding: '6px 10px',
            borderRadius: '9999px',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer'
          }}
        >
          {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          {isOnline ? 'Online' : 'Offline'}
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: 'white',
            border: 'none',
            width: 34,
            height: 34,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
          }}
          title="AI Voice & Notebook Assistant"
        >
          <Sparkles size={16} />
        </button>

        {isPinEnabled && (
          <button
            onClick={lockApp}
            title="Lock App with PIN"
            style={{
              background: 'var(--debt-50)',
              color: 'var(--debt-600)',
              border: '1px solid var(--debt-200)',
              width: 34,
              height: 34,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Lock size={15} />
          </button>
        )}

        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-card-hover)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-light)',
            width: 34,
            height: 34,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </header>
  );
};

