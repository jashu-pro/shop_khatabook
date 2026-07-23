import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';
import { WelcomeCard } from '../components/WelcomeCard';
import { DashboardMetrics } from '../components/DashboardMetrics';
import { SalesChart } from '../components/SalesChart';
import { QuickActions } from '../components/QuickActions';
import { RecentActivity } from '../components/RecentActivity';
import { 
  useDashboardMetricsQuery, 
  useWeeklySalesQuery, 
  useRecentActivitiesQuery 
} from '../hooks/useDashboard';
import { Sparkles, Info, X } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [alertInfo, setAlertInfo] = useState<string | null>(null);

  // Queries
  const { data: metrics, isLoading: isMetricsLoading } = useDashboardMetricsQuery(user?.id);
  const { data: sales, isLoading: isSalesLoading } = useWeeklySalesQuery(user?.id);
  const { data: activities, isLoading: isActivitiesLoading } = useRecentActivitiesQuery(user?.id);

  const handleComingSoonAlert = (featureName: string) => {
    setAlertInfo(featureName);
  };

  return (
    <div style={styles.layoutWrapper}>
      {/* Sidebar Navigation */}
      <Sidebar onComingSoonAlert={handleComingSoonAlert} />

      {/* Main Content Pane */}
      <div style={styles.mainPane}>
        {/* Top Header Bar */}
        <TopBar />

        {/* Dynamic Alerts Banner */}
        {alertInfo && (
          <div style={styles.alertBanner} className="animate-fade-in">
            <div style={styles.alertLeft}>
              <Sparkles size={16} style={{ color: 'var(--primary)' }} />
              <span style={styles.alertText}>
                The <strong>{alertInfo}</strong> feature is part of future development phases. Keep verifying shop setups!
              </span>
            </div>
            <button onClick={() => setAlertInfo(null)} style={styles.closeAlertBtn}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Content Body Grid */}
        <div style={styles.bodyGrid}>
          {/* Row 1: Greetings */}
          <WelcomeCard />

          {/* Row 2: Stats Grid */}
          <DashboardMetrics metrics={metrics} isLoading={isMetricsLoading} />

          {/* Row 3: Chart & Activity Feed */}
          <div style={styles.analyticsSection}>
            <div style={{ flex: '2 1 0px', display: 'flex' }}>
              <SalesChart salesData={sales} isLoading={isSalesLoading} />
            </div>
            <div style={{ flex: '1 1 0px', display: 'flex' }}>
              <RecentActivity activities={activities} isLoading={isActivitiesLoading} />
            </div>
          </div>

          {/* Row 4: Shortcuts Operations */}
          <QuickActions onComingSoonAlert={handleComingSoonAlert} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  layoutWrapper: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'var(--bg-primary)',
    padding: '16px',
    gap: '16px',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  mainPane: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 32px)',
    paddingRight: '4px',
  } as React.CSSProperties,
  alertBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    backgroundColor: 'var(--primary-light)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--primary)',
    width: '100%',
  } as React.CSSProperties,
  alertLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  } as React.CSSProperties,
  alertText: {
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  closeAlertBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
  } as React.CSSProperties,
  bodyGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '100%',
  } as React.CSSProperties,
  analyticsSection: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    width: '100%',
  } as React.CSSProperties,
};
