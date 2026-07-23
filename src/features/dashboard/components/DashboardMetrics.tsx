import React from 'react';
import { 
  Users, 
  TrendingUp, 
  ShoppingBag, 
  CircleDollarSign, 
  Clock, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import type { DashboardMetrics as MetricsType } from '../types/dashboard.types';

interface DashboardMetricsProps {
  metrics: MetricsType | null | undefined;
  isLoading: boolean;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metrics, isLoading }) => {
  if (isLoading) {
    return (
      <div style={styles.grid}>
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} style={styles.card} className="glass-panel loading-shimmer">
            <div style={styles.skeletonHeader} />
            <div style={styles.skeletonAmount} />
            <div style={styles.skeletonTrend} />
          </div>
        ))}
      </div>
    );
  }

  const formatAmount = (num: number | undefined) => {
    if (num === undefined) return '0';
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const cards = [
    {
      title: 'Total Customers',
      value: metrics?.totalCustomers,
      prefix: '',
      trend: metrics?.totalCustomersTrend,
      icon: <Users size={20} style={{ color: '#6366f1' }} />,
      desc: 'Registered in ledger',
      isGoodPositive: true,
    },
    {
      title: 'Outstanding Credit',
      value: metrics?.outstandingCredit,
      prefix: '₹',
      trend: metrics?.outstandingCreditTrend,
      icon: <TrendingUp size={20} style={{ color: '#ef4444' }} />,
      desc: 'Collectible amount',
      isGoodPositive: false, // Decreasing outstanding credit is GOOD!
    },
    {
      title: "Today's Sales",
      value: metrics?.todaySales,
      prefix: '₹',
      trend: metrics?.todaySalesTrend,
      icon: <ShoppingBag size={20} style={{ color: '#10b981' }} />,
      desc: 'Recorded transactions',
      isGoodPositive: true,
    },
    {
      title: "Today's Collections",
      value: metrics?.todayCollections,
      prefix: '₹',
      trend: metrics?.todayCollectionsTrend,
      icon: <CircleDollarSign size={20} style={{ color: '#f59e0b' }} />,
      desc: 'Credit cash collection',
      isGoodPositive: true,
    },
    {
      title: 'Pending Payments',
      value: metrics?.pendingPayments,
      prefix: '',
      trend: metrics?.pendingPaymentsTrend,
      icon: <Clock size={20} style={{ color: '#a855f7' }} />,
      desc: 'Invoices awaiting pay',
      isGoodPositive: false, // Decreasing pending count is GOOD
    },
    {
      title: 'Active Customers',
      value: metrics?.activeCustomers,
      prefix: '',
      trend: metrics?.activeCustomersTrend,
      icon: <Activity size={20} style={{ color: '#06b6d4' }} />,
      desc: 'Transacted this week',
      isGoodPositive: true,
    },
  ];

  return (
    <div style={styles.grid}>
      {cards.map((card, idx) => {
        const hasTrend = card.trend !== undefined;
        const isTrendPositive = hasTrend && card.trend! > 0;
        const trendValue = hasTrend ? Math.abs(card.trend!) : 0;
        
        // Determine whether trend is green/red based on business context
        const isGoodTrend = (isTrendPositive && card.isGoodPositive) || (!isTrendPositive && !card.isGoodPositive);

        return (
          <div key={idx} style={styles.card} className="glass-panel animate-fade-in">
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>{card.title}</span>
              <div style={styles.iconBox}>{card.icon}</div>
            </div>

            <div style={styles.cardBody}>
              <h3 style={styles.cardValue}>
                {card.prefix}
                {formatAmount(card.value)}
              </h3>

              <div style={styles.cardFooter}>
                {hasTrend && (
                  <span
                    style={{
                      ...styles.trendBadge,
                      backgroundColor: isGoodTrend ? 'var(--success-light)' : 'var(--danger-light)',
                      color: isGoodTrend ? 'var(--success)' : 'var(--danger)',
                    }}
                  >
                    {isTrendPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    <span>{trendValue}%</span>
                  </span>
                )}
                <span style={styles.cardDesc}>{card.desc}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    width: '100%',
  } as React.CSSProperties,
  card: {
    padding: '20px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '130px',
  } as React.CSSProperties,
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  } as React.CSSProperties,
  cardTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  } as React.CSSProperties,
  iconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-sm)',
  } as React.CSSProperties,
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '12px',
  } as React.CSSProperties,
  cardValue: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
  } as React.CSSProperties,
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  } as React.CSSProperties,
  trendBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    padding: '2px 6px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.7rem',
    fontWeight: '700',
  } as React.CSSProperties,
  cardDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '500',
  } as React.CSSProperties,
  // Skeletons
  skeletonHeader: {
    height: '20px',
    width: '120px',
    backgroundColor: 'var(--border-color)',
    borderRadius: '4px',
  } as React.CSSProperties,
  skeletonAmount: {
    height: '32px',
    width: '150px',
    backgroundColor: 'var(--border-color)',
    borderRadius: '4px',
    marginTop: '16px',
  } as React.CSSProperties,
  skeletonTrend: {
    height: '14px',
    width: '80px',
    backgroundColor: 'var(--border-color)',
    borderRadius: '4px',
    marginTop: '8px',
  } as React.CSSProperties,
};
