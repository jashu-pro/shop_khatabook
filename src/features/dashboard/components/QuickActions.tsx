import React from 'react';
import { UserPlus, PlusCircle, CircleDollarSign, BookOpen } from 'lucide-react';

interface QuickActionsProps {
  onComingSoonAlert: (feature: string) => void;
  onActionClick?: (actionId: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onComingSoonAlert, onActionClick }) => {
  const actions = [
    {
      id: 'add_customer',
      label: 'Add Customer',
      icon: <UserPlus size={20} />,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.08)',
      borderColor: 'rgba(99, 102, 241, 0.2)',
      desc: 'Register a new notebook debtor',
    },
    {
      id: 'record_sale',
      label: 'Record Credit Sale',
      icon: <PlusCircle size={20} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.2)',
      desc: 'Debit items on customer ledger',
    },
    {
      id: 'receive_payment',
      label: 'Receive Payment',
      icon: <CircleDollarSign size={20} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.08)',
      borderColor: 'rgba(245, 158, 11, 0.2)',
      desc: 'Credit payments to clear balances',
    },
    {
      id: 'view_ledger',
      label: 'View Ledger',
      icon: <BookOpen size={20} />,
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.08)',
      borderColor: 'rgba(168, 85, 247, 0.2)',
      desc: 'Check accounts & credit logs',
    },
  ];

  const handleAction = (act: typeof actions[0]) => {
    if (onActionClick) {
      onActionClick(act.id);
    } else {
      onComingSoonAlert(act.label);
    }
  };

  return (
    <div style={styles.container} className="glass-panel animate-fade-in">
      <h3 style={styles.title}>Quick Operations</h3>
      
      <div style={styles.grid}>
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => handleAction(act)}
            style={{
              ...styles.btn,
              backgroundColor: act.bgColor,
              borderColor: act.borderColor,
            }}
            className="quick-action-card"
          >
            <div
              style={{
                ...styles.iconWrapper,
                color: act.color,
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              {act.icon}
            </div>
            <div style={styles.textGroup}>
              <span style={styles.label}>{act.label}</span>
              <span style={styles.desc}>{act.desc}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  } as React.CSSProperties,
  title: {
    fontSize: '1rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
  } as React.CSSProperties,
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all var(--transition-fast)',
  } as React.CSSProperties,
  iconWrapper: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-sm)',
    flexShrink: 0,
  } as React.CSSProperties,
  textGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  } as React.CSSProperties,
  label: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  desc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.3',
  } as React.CSSProperties,
};
