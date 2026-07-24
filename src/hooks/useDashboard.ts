import { useQuery } from '@tanstack/react-query';
import { dashboardService } from 'shared';
import type { DashboardMetrics, SalesDataPoint, ActivityItem } from 'shared';

export const useDashboardMetricsQuery = (ownerId: string | undefined) => {
  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard', 'metrics', ownerId],
    queryFn: () => (ownerId ? dashboardService.getDashboardMetrics(ownerId) : {
      totalCustomers: 0,
      outstandingCredit: 0,
      todaySales: 0,
      todayCollections: 0,
      pendingPayments: 0,
      activeCustomers: 0,
      totalCustomersTrend: 0,
      outstandingCreditTrend: 0,
      todaySalesTrend: 0,
      todayCollectionsTrend: 0,
      pendingPaymentsTrend: 0,
      activeCustomersTrend: 0,
    }),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useWeeklySalesQuery = (ownerId: string | undefined) => {
  return useQuery<SalesDataPoint[]>({
    queryKey: ['dashboard', 'sales', ownerId],
    queryFn: () => (ownerId ? dashboardService.getWeeklySales(ownerId) : []),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useRecentActivitiesQuery = (ownerId: string | undefined) => {
  return useQuery<ActivityItem[]>({
    queryKey: ['dashboard', 'activities', ownerId],
    queryFn: () => (ownerId ? dashboardService.getRecentActivities(ownerId) : []),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};
