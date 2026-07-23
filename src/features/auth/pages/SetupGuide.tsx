import React from 'react';
import { APP_NAME } from '@/constants/env';
import { AlertTriangle, RefreshCw, Key, Link } from 'lucide-react';

export const SetupGuide: React.FC = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="setup-container animate-fade-in">
      <div className="setup-card glass-panel" style={styles.card}>
        <div style={styles.iconWrapper}>
          <AlertTriangle size={36} style={{ color: 'var(--warning)' }} />
        </div>
        
        <h1 style={styles.title}>Configuration Required</h1>
        <p style={styles.subtitle}>
          Welcome to <strong>{APP_NAME}</strong>! To run this application, you must connect your own Supabase database project first.
        </p>

        <div style={styles.steps}>
          <h3 style={styles.stepsTitle}>How to configure:</h3>
          <ol style={styles.stepsList}>
            <li>
              Create a project on <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={styles.link}>Supabase <Link size={12} style={{ display: 'inline' }} /></a> if you haven't already.
            </li>
            <li>
              Copy the **Project URL** and **API Anon Key** from your Supabase settings page (Settings &gt; API).
            </li>
            <li>
              Create a file named <code>.env</code> in the root directory of this project and add the variables below.
            </li>
          </ol>
        </div>

        <div style={styles.codeTitle}>
          <Key size={14} />
          <span>Add this to your <code>.env</code> file:</span>
        </div>
        
        <pre className="code-block">
{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME="Shop KhattaBook"
VITE_APP_VERSION=1.0.0`}
        </pre>

        <button 
          onClick={handleRefresh} 
          className="btn btn-primary" 
          style={styles.refreshButton}
        >
          <RefreshCw size={16} />
          <span>I've set it up, Reload App</span>
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  } as React.CSSProperties,
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--warning-light)',
    marginBottom: '8px',
  } as React.CSSProperties,
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  } as React.CSSProperties,
  steps: {
    textAlign: 'left',
    width: '100%',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '20px',
  } as React.CSSProperties,
  stepsTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    marginBottom: '10px',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  stepsList: {
    paddingLeft: '20px',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as React.CSSProperties,
  link: {
    fontWeight: '600',
    color: 'var(--primary)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  } as React.CSSProperties,
  codeTitle: {
    width: '100%',
    textAlign: 'left',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '8px',
  } as React.CSSProperties,
  refreshButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '12px',
  } as React.CSSProperties,
};
