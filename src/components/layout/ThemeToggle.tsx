import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import type { ThemeMode } from '@/store/themeStore';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  const themeOptions: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'light', label: 'Light', icon: <Sun size={14} /> },
    { mode: 'dark', label: 'Dark', icon: <Moon size={14} /> },
    { mode: 'system', label: 'System', icon: <Monitor size={14} /> },
  ];

  return (
    <div style={styles.container}>
      {themeOptions.map((opt) => {
        const isActive = theme === opt.mode;
        return (
          <button
            key={opt.mode}
            onClick={() => setTheme(opt.mode)}
            style={{
              ...styles.tabButton,
              backgroundColor: isActive ? 'var(--primary)' : 'transparent',
              color: isActive ? '#ffffff' : 'var(--text-secondary)',
              border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
            }}
            title={`Set theme to ${opt.label}`}
          >
            {opt.icon}
            <span style={styles.labelText}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const styles = {
  container: {
    display: 'inline-flex',
    padding: '4px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    gap: '2px',
  } as React.CSSProperties,
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    fontSize: '0.8rem',
    fontWeight: '600',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
  } as React.CSSProperties,
  labelText: {
    display: 'inline-block',
  } as React.CSSProperties,
};
