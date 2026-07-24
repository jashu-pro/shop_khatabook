export interface DashboardMetrics {
  totalCustomers: number;
  outstandingCredit: number;
  todaySales: number;
  todayCollections: number;
  pendingPayments: number;
  activeCustomers: number;
  
  // Trend percentage indicators (relative to yesterday/last week)
  totalCustomersTrend: number;
  outstandingCreditTrend: number;
  todaySalesTrend: number;
  todayCollectionsTrend: number;
  pendingPaymentsTrend: number;
  activeCustomersTrend: number;
}

export interface SalesDataPoint {
  date: string;
  dayName: string;
  amount: number;
}

export interface ActivityItem {
  id: string;
  customerName: string;
  customerPhone?: string;
  type: 'sale' | 'payment';
  amount: number;
  time: string;
}
