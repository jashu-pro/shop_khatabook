import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export const useDashboardMetricsQuery = (ownerId: string | undefined) => {
  return useQuery({
    queryKey: ['dashboard', 'metrics', ownerId],
    queryFn: () => (ownerId ? dashboardService.getDashboardMetrics(ownerId) : null),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
};

export const useWeeklySalesQuery = (ownerId: string | undefined) => {
  return useQuery({
    queryKey: ['dashboard', 'sales-weekly', ownerId],
    queryFn: () => (ownerId ? dashboardService.getWeeklySales(ownerId) : null),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useRecentActivitiesQuery = (ownerId: string | undefined) => {
  return useQuery({
    queryKey: ['dashboard', 'activities', ownerId],
    queryFn: () => (ownerId ? dashboardService.getRecentActivities(ownerId) : null),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 1, // 1 minute cache
  });
};
