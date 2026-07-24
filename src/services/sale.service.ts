import { supabase } from '../lib/supabase';
import { IS_ENV_VALID } from '../constants/env';
import type { Sale, Payment, CreateSaleInput, CustomerBalance } from '../types/sale.types';

export interface SaleWithCustomer extends Sale {
  customers: {
    name: string;
    phone: string | null;
    photo_url: string | null;
    village: string | null;
  } | null;
}

export const saleService = {
  /**
   * Fetch all sales for a specific shop, joining customer meta details
   */
  async getSales(shopId: string): Promise<SaleWithCustomer[]> {
    if (!IS_ENV_VALID) return [];

    const { data, error } = await supabase
      .from('sales')
      .select('*, customers(name, phone, photo_url, village)')
      .eq('shop_id', shopId)
      .order('sale_date', { ascending: false });

    if (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
    return (data || []) as SaleWithCustomer[];
  },

  /**
   * Get dynamic balance summary (Total Sales, Total Payments, Net Outstanding) for a customer
   */
  async getCustomerBalance(customerId: string): Promise<CustomerBalance> {
    if (!IS_ENV_VALID) {
      return { total_sales: 0, total_payments: 0, outstanding_credit: 0 };
    }

    // 1. Fetch total sales amount
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('total_amount')
      .eq('customer_id', customerId);

    if (salesError) {
      console.error('Error getting customer sales:', salesError);
      throw salesError;
    }

    // 2. Fetch total payments amount
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('payment_amount')
      .eq('customer_id', customerId);

    if (paymentsError) {
      console.error('Error getting customer payments:', paymentsError);
      throw paymentsError;
    }

    const totalSales = (salesData || []).reduce(
      (sum: number, s: any) => sum + Number(s.total_amount),
      0
    );
    const totalPayments = (paymentsData || []).reduce(
      (sum: number, p: any) => sum + Number(p.payment_amount),
      0
    );

    return {
      total_sales: totalSales,
      total_payments: totalPayments,
      outstanding_credit: totalSales - totalPayments,
    };
  },

  /**
   * Insert a new credit sale entry
   */
  async createSale(input: CreateSaleInput): Promise<Sale> {
    if (!IS_ENV_VALID) throw new Error('Supabase is not configured.');

    // Generate unique invoice number if not set (e.g. SALE-[timestamp])
    const payload = {
      ...input,
      sale_number: input.sale_number || `SL-${Date.now()}`,
    };

    const { data, error } = await supabase.from('sales').insert([payload]).select().single();

    if (error) {
      console.error('Error creating credit sale:', error);
      throw error;
    }
    return data;
  },

  /**
   * Delete a credit sale entry
   */
  async deleteSale(saleId: string): Promise<void> {
    if (!IS_ENV_VALID) return;

    const { error } = await supabase.from('sales').delete().eq('id', saleId);

    if (error) {
      console.error('Error deleting credit sale:', error);
      throw error;
    }
  },

  /**
   * Upload invoice/bill photo to the 'bill-attachments' storage bucket
   * On mobile, the base64Data might represent file:/// local URIs.
   */
  async uploadBillPhoto(
    shopId: string,
    fileName: string,
    base64Data: string
  ): Promise<{ url: string; path: string } | null> {
    if (!IS_ENV_VALID || !base64Data) return null;

    if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
      return { url: base64Data, path: base64Data };
    }

    try {
      const res = await fetch(base64Data);
      const blob = await res.blob();

      const path = `${shopId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('bill-attachments')
        .upload(path, blob, {
          upsert: true,
          contentType: blob.type || 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('bill-attachments').getPublicUrl(path);

      return { url: publicUrl, path };
    } catch (err: any) {
      console.error('Error uploading bill attachment:', err);
      throw new Error(`Failed to upload bill photo: ${err.message}`);
    }
  },

  /**
   * Fetch customer ledger records (both sales and payments) sorted by date desc
   */
  async getCustomerLedger(customerId: string): Promise<{ sales: Sale[]; payments: Payment[] }> {
    if (!IS_ENV_VALID) return { sales: [], payments: [] };

    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .eq('customer_id', customerId)
      .order('sale_date', { ascending: false });

    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_id', customerId)
      .order('payment_date', { ascending: false });

    if (salesError) {
      console.error('Error fetching customer sales ledger:', salesError);
      throw salesError;
    }
    if (paymentsError) {
      console.error('Error fetching customer payments ledger:', paymentsError);
      throw paymentsError;
    }

    return {
      sales: sales || [],
      payments: payments || [],
    };
  },
};
