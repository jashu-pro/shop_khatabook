export type UserRole = 'owner' | 'manager' | 'cashier' | 'accountant';

export type PaymentMethod = 
  | 'CASH' 
  | 'UPI_PHONEPE' 
  | 'UPI_GPAY' 
  | 'UPI_PAYTM' 
  | 'BANK_TRANSFER' 
  | 'CHEQUE' 
  | 'OTHER';

export type StockMovementType = 'SALE' | 'PURCHASE' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGE';

export type NotificationType = 'WHATSAPP' | 'SMS' | 'AI_SUMMARY';

export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'retrying';

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string; // Free, Pro, Enterprise
  max_shops: number;
  max_customers: number;
  monthly_price: number;
  features: string[];
}

export interface Subscription {
  id: string;
  shop_id: string;
  plan_id: string;
  status: 'active' | 'trial' | 'expired';
  current_period_end: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  shop_name: string;
  name?: string;
  shop_logo_url?: string;
  shop_logo_path?: string;
  owner_photo_url?: string;
  owner_photo_path?: string;
  business_category: string;
  category?: string;
  door_number?: string;
  door_no?: string;
  street?: string;
  area?: string;
  village: string;
  village_town?: string;
  mandal?: string;
  district: string;
  state: string;
  pin_code?: string;
  pincode?: string;
  country?: string;
  gst?: string;
  gstin?: string;
  pan?: string;
  upi_id?: string;
  business_email?: string;
  language?: string;
  currency: string;
  theme?: 'Light' | 'Dark' | 'System';
  payment_reminder?: boolean;
  whatsapp_reminder?: boolean;
  sms_reminder?: boolean;
  ai_daily_summary?: boolean;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ShopUser {
  id: string;
  shop_id: string;
  user_id: string;
  user_name?: string;
  user_phone?: string;
  role: UserRole;
  status: 'active' | 'invited' | 'disabled';
  created_at: string;
}

export type CustomerTag = 'VIP' | 'Regular' | 'Risk' | 'Blocked' | 'New';

export interface Customer {
  id: string;
  shop_id: string;
  name: string;
  phone: string;
  photo_url?: string;
  village: string;
  address?: string;
  notes?: string;
  tags: CustomerTag[];
  credit_limit: number;
  credit_score: number; // e.g. 750
  last_payment_date?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  is_deleted?: boolean;
}

export interface Category {
  id: string;
  shop_id: string;
  name: string;
  created_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  category_id?: string;
  category_name?: string;
  name: string;
  barcode?: string;
  selling_price: number;
  purchase_price: number;
  stock_quantity: number;
  min_stock_alert: number;
  supplier_name?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface StockMovement {
  id: string;
  shop_id: string;
  product_id: string;
  product_name?: string;
  movement_type: StockMovementType;
  quantity: number;
  reference_sale_id?: string;
  reference_purchase_id?: string;
  notes?: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id?: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Sale {
  id: string;
  shop_id: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  bill_photo_url?: string;
  notes?: string;
  items: SaleItem[];
  created_at: string;
  deleted_at?: string;
}

export interface Payment {
  id: string;
  shop_id: string;
  customer_id: string;
  customer_name?: string;
  sale_id?: string;
  amount: number;
  method: PaymentMethod;
  reference_no?: string; // UTR Number
  bank_name?: string;
  screenshot_url?: string;
  notes?: string;
  created_at: string;
  deleted_at?: string;
}

export type LedgerEntryType = 'SALE' | 'PAYMENT';

export interface LedgerEntry {
  id: string;
  shop_id: string;
  customer_id: string;
  customer_name?: string;
  entry_type: LedgerEntryType;
  sale_id?: string;
  payment_id?: string;
  debit: number;   // Udhaar (Given / Owed)
  credit: number;  // Jama (Received / Paid)
  running_balance: number;
  description: string;
  entry_date: string;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  shop_id: string;
  customer_id?: string;
  customer_name?: string;
  type: NotificationType;
  status: NotificationStatus;
  retry_count: number;
  last_error?: string;
  scheduled_at: string;
  sent_at?: string;
  payload: Record<string, any>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name?: string;
  action: string; // CREATE, UPDATE, DELETE, AI_PARSE_CONFIRM
  table_name: string;
  record_id: string;
  before_state?: any;
  after_state?: any;
  created_at: string;
}

export interface AIRequestLog {
  id: string;
  shop_id: string;
  user_id: string;
  prompt: string;
  parsed_result: {
    type: 'SALE' | 'PAYMENT' | 'CUSTOMER_QUERY';
    customer_name?: string;
    items?: Array<{ name: string; quantity: number; price: number }>;
    total_amount?: number;
    amount_paid?: number;
    notes?: string;
    query_answer?: string;
  };
  approved: boolean;
  approved_by?: string;
  created_at: string;
}

export type ActiveTab = 'dashboard' | 'customers' | 'sales' | 'inventory' | 'ledger' | 'reports' | 'ai' | 'settings';
