import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { APP_NAME, APP_VERSION } from '@/constants/env';
import { BookOpen } from 'lucide-react';

export const Splash: React.FC = () => {
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();

  useEffect(() => {
    if (initialized) {
      const timer = setTimeout(() => {
        if (user) {
          navigate('/', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }, 1500); // Elegant brand transition delay

      return () => clearTimeout(timer);
    }
  }, [initialized, user, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.content} className="animate-fade-in">
        <div style={styles.logoWrapper}>
          <BookOpen size={48} style={{ color: '#ffffff' }} />
        </div>
        <h1 style={styles.title}>{APP_NAME}</h1>
        <p style={styles.subtitle}>Digitizing your traditional notebook ledger</p>
        
        <div style={styles.loaderContainer}>
          <div style={styles.loaderLine} />
        </div>
        
        <div style={styles.footer}>
          <span>Version {APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#090d16', // Always deep dark background for cinematic splash
    color: '#ffffff',
    padding: '24px',
  } as React.CSSProperties,
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    position: 'relative',
  } as React.CSSProperties,
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '96px',
    height: '96px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    boxShadow: '0 12px 24px -8px rgba(99, 102, 241, 0.5)',
    marginBottom: '24px',
  } as React.CSSProperties,
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    letterSpacing: '-0.025em',
    marginBottom: '8px',
    color: '#ffffff',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '1rem',
    color: '#9ca3af',
    marginBottom: '48px',
    fontWeight: '500',
  } as React.CSSProperties,
  loaderContainer: {
    width: '180px',
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: '48px',
  } as React.CSSProperties,
  loaderLine: {
    position: 'absolute',
    height: '100%',
    width: '40%',
    backgroundColor: '#6366f1',
    borderRadius: '2px',
    animation: 'shimmer 1.5s infinite linear',
  } as React.CSSProperties,
  footer: {
    position: 'absolute',
    bottom: '-120px',
    fontSize: '0.85rem',
    color: '#4b5563',
    fontWeight: '600',
  } as React.CSSProperties,
};
