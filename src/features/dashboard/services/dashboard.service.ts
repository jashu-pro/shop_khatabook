import type { DashboardMetrics, SalesDataPoint, ActivityItem } from '../types/dashboard.types';

export const dashboardService = {
  /**
   * Fetch aggregate statistics and metrics counters
   */
  async getDashboardMetrics(_ownerId: string): Promise<DashboardMetrics> {
    // Simulate database lookup delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return {
      totalCustomers: 28,
      outstandingCredit: 18450,
      todaySales: 5200,
      todayCollections: 3200,
      pendingPayments: 4,
      activeCustomers: 19,
      
      totalCustomersTrend: 12, // +12% increase
      outstandingCreditTrend: -4, // -4% decrease (good for outstanding credit!)
      todaySalesTrend: 18, // +18% increase
      todayCollectionsTrend: 8, // +8% increase
      pendingPaymentsTrend: -20, // -20% decrease (fewer pending payments!)
      activeCustomersTrend: 15, // +15% increase
    };
  },

  /**
   * Fetch daily sales logs for charts (Last 7 Days)
   */
  async getWeeklySales(_ownerId: string): Promise<SalesDataPoint[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dataPoints: SalesDataPoint[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      
      // Generating beautiful mock chart waves
      const mockSalesAmounts = [3500, 4800, 4200, 5800, 5200, 6800, 5200];
      const index = (d.getDay() + 7) % 7;
      
      dataPoints.push({
        date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        dayName: dayNames[index],
        amount: mockSalesAmounts[6 - i] || 4000,
      });
    }

    return dataPoints;
  },

  /**
   * Fetch recent transaction list for the dashboard feed
   */
  async getRecentActivities(_ownerId: string): Promise<ActivityItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return [
      {
        id: 'act_1',
        customerName: 'Ramesh Kumar',
        customerPhone: '9876543210',
        type: 'sale',
        amount: 2450,
        time: '15 mins ago',
      },
      {
        id: 'act_2',
        customerName: 'Karan Singh',
        customerPhone: '8765432109',
        type: 'payment',
        amount: 1500,
        time: '1 hour ago',
      },
      {
        id: 'act_3',
        customerName: 'Suresh Patel',
        customerPhone: '7654321098',
        type: 'sale',
        amount: 1200,
        time: '3 hours ago',
      },
      {
        id: 'act_4',
        customerName: 'Amit Verma',
        customerPhone: '6543210987',
        type: 'payment',
        amount: 800,
        time: 'Yesterday',
      },
      {
        id: 'act_5',
        customerName: 'Vijay Naidu',
        customerPhone: '9440557489',
        type: 'sale',
        amount: 3200,
        time: '2 days ago',
      },
    ];
  },
};
