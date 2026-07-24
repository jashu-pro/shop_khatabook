export interface Sale {
  id: string;
  shop_id: string;
  customer_id: string;
  sale_number: string;
  sale_date: string;
  total_amount: number;
  notes: string | null;
  bill_photo_url: string | null;
  bill_photo_path: string | null;

  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  shop_id: string;
  customer_id: string;
  payment_amount: number;
  payment_method: 'cash' | 'upi' | 'bank_transfer';
  payment_date: string;
  notes: string | null;

  created_at: string;
  updated_at: string;
}

export type CreateSaleInput = Omit<Sale, 'id' | 'created_at' | 'updated_at'>;
export type CreatePaymentInput = Omit<Payment, 'id' | 'created_at' | 'updated_at'>;

export interface CustomerBalance {
  total_sales: number;
  total_payments: number;
  outstanding_credit: number;
}
