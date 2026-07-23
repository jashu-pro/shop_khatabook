import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering crash:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={styles.container}>
          <div style={styles.card} className="glass-panel animate-fade-in">
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.message}>
              We encountered an unexpected crash. If the issue persists, please contact support.
            </p>
            {this.state.error && (
              <pre style={styles.details}>
                {this.state.error.name}: {this.state.error.message}
              </pre>
            )}
            <button style={styles.button} className="btn btn-primary" onClick={this.handleReload}>
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '24px',
    backgroundColor: 'var(--bg-primary)',
  } as React.CSSProperties,
  card: {
    maxWidth: '500px',
    width: '100%',
    padding: '32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  } as React.CSSProperties,
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: 'var(--danger)',
  } as React.CSSProperties,
  message: {
    fontSize: '0.95rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  } as React.CSSProperties,
  details: {
    width: '100%',
    textAlign: 'left',
    padding: '12px',
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    fontFamily: 'monospace',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  button: {
    marginTop: '8px',
    width: '100%',
  } as React.CSSProperties,
};
