import React from 'react';
import type { ActivityItem } from '../types/dashboard.types';
import { ArrowUpRight, ArrowDownRight, BookOpen } from 'lucide-react';

interface RecentActivityProps {
  activities: ActivityItem[] | null | undefined;
  isLoading: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <div style={styles.container} className="glass-panel">
        <h3 style={styles.title}>Recent Activity</h3>
        <div style={styles.list} className="loading-shimmer">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} style={styles.skeletonItem} />
          ))}
        </div>
      </div>
    );
  }

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const hasActivities = activities && activities.length > 0;

  return (
    <div style={styles.container} className="glass-panel animate-fade-in">
      <h3 style={styles.title}>Recent Activity</h3>

      {hasActivities ? (
        <div style={styles.list}>
          {activities.map((act) => {
            const isSale = act.type === 'sale';
            return (
              <div key={act.id} style={styles.item} className="activity-item">
                <div
                  style={{
                    ...styles.iconBox,
                    backgroundColor: isSale ? 'var(--danger-light)' : 'var(--success-light)',
                    color: isSale ? 'var(--danger)' : 'var(--success)',
                  }}
                >
                  {isSale ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                </div>

                <div style={styles.meta}>
                  <span style={styles.name}>{act.customerName}</span>
                  <span style={styles.type}>
                    {isSale ? 'Credit Purchase' : 'Payment Received'}
                  </span>
                </div>

                <div style={styles.rightGroup}>
                  <span
                    style={{
                      ...styles.amount,
                      color: isSale ? 'var(--danger)' : 'var(--success)',
                    }}
                  >
                    {isSale ? '+' : '-'} ₹{formatAmount(act.amount)}
                  </span>
                  <span style={styles.time}>{act.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIconBox}>
            <BookOpen size={24} style={{ color: 'var(--text-muted)' }} />
          </div>
          <span style={styles.emptyTitle}>No transaction logs yet</span>
          <p style={styles.emptyDesc}>
            Your shop ledger is currently empty. Tap **Add Customer** to start recording credit sales.
          </p>
        </div>
      )}
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
    minHeight: '340px',
  } as React.CSSProperties,
  title: {
    fontSize: '1rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '360px',
    overflowY: 'auto',
  } as React.CSSProperties,
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    transition: 'border-color var(--transition-fast)',
  } as React.CSSProperties,
  iconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  } as React.CSSProperties,
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flexGrow: 1,
  } as React.CSSProperties,
  name: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  type: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  } as React.CSSProperties,
  rightGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  } as React.CSSProperties,
  amount: {
    fontSize: '0.9rem',
    fontWeight: '800',
  } as React.CSSProperties,
  time: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  } as React.CSSProperties,
  // Empty State
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 16px',
    flexGrow: 1,
    gap: '8px',
  } as React.CSSProperties,
  emptyIconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  } as React.CSSProperties,
  emptyTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  emptyDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    maxWidth: '240px',
    lineHeight: '1.4',
  } as React.CSSProperties,
  // Skeleton Loader
  skeletonItem: {
    height: '60px',
    width: '100%',
    backgroundColor: 'var(--border-color)',
    borderRadius: 'var(--radius-sm)',
  } as React.CSSProperties,
};
