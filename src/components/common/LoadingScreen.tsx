import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  fullScreen = true 
}) => {
  return (
    <div style={fullScreen ? styles.fullScreenContainer : styles.inlineContainer}>
      <div style={styles.content} className="animate-fade-in">
        <div style={styles.spinnerWrapper}>
          <Loader2 
            size={40} 
            className="animate-spin" 
            style={{ color: 'var(--primary)' }} 
          />
        </div>
        <p style={styles.text}>{message}</p>
      </div>
    </div>
  );
};

const styles = {
  fullScreenContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: 'var(--bg-primary)',
    zIndex: 9999,
  } as React.CSSProperties,
  inlineContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    width: '100%',
    minHeight: '200px',
  } as React.CSSProperties,
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    textAlign: 'center',
  } as React.CSSProperties,
  spinnerWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-md)',
  } as React.CSSProperties,
  text: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    letterSpacing: '0.025em',
  } as React.CSSProperties,
};
