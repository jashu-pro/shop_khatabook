// Supabase Service Integration with automatic LocalStorage Fallback & Background Cloud Sync
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Customer, Product, Sale, Payment, LedgerEntry } from '../types';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) && 
    Boolean(supabaseAnonKey) &&
    supabaseUrl.startsWith('http') &&
    supabaseUrl !== 'https://mock.supabase.co'
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to push customer to Supabase DB
export const syncCustomerToCloud = async (customer: Customer) => {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('customers').upsert({
      id: customer.id,
      shop_id: customer.shop_id,
      name: customer.name,
      phone: customer.phone,
      photo_url: customer.photo_url,
      village: customer.village,
      address: customer.address,
      notes: customer.notes,
      tags: customer.tags,
      credit_limit: customer.credit_limit,
      credit_score: customer.credit_score,
      last_payment_date: customer.last_payment_date,
      is_deleted: customer.is_deleted || false,
      created_at: customer.created_at
    });
    if (error) console.warn('Supabase customer sync warning:', error.message);
  } catch (err) {
    console.warn('Supabase customer sync exception:', err);
  }
};

// Helper to push product to Supabase DB
export const syncProductToCloud = async (product: Product) => {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('products').upsert({
      id: product.id,
      shop_id: product.shop_id,
      category_id: product.category_id,
      category_name: product.category_name,
      name: product.name,
      barcode: product.barcode,
      selling_price: product.selling_price,
      purchase_price: product.purchase_price,
      stock_quantity: product.stock_quantity,
      min_stock_alert: product.min_stock_alert,
      supplier_name: product.supplier_name,
      created_at: product.created_at
    });
    if (error) console.warn('Supabase product sync warning:', error.message);
  } catch (err) {
    console.warn('Supabase product sync exception:', err);
  }
};

// Helper to push sale to Supabase DB
export const syncSaleToCloud = async (sale: Sale) => {
  if (!supabase) return;
  try {
    const { error: saleErr } = await supabase.from('sales').upsert({
      id: sale.id,
      shop_id: sale.shop_id,
      customer_id: sale.customer_id,
      customer_name: sale.customer_name,
      customer_phone: sale.customer_phone,
      subtotal: sale.subtotal,
      discount: sale.discount,
      tax: sale.tax,
      total_amount: sale.total_amount,
      amount_paid: sale.amount_paid,
      balance_due: sale.balance_due,
      bill_photo_url: sale.bill_photo_url,
      notes: sale.notes,
      created_at: sale.created_at
    });
    if (saleErr) console.warn('Supabase sale sync warning:', saleErr.message);

    if (sale.items && sale.items.length > 0) {
      const dbItems = sale.items.map(item => ({
        id: item.id,
        sale_id: sale.id,
        product_id: item.product_id || null,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }));
      await supabase.from('sale_items').upsert(dbItems);
    }
  } catch (err) {
    console.warn('Supabase sale sync exception:', err);
  }
};

// Helper to push payment to Supabase DB
export const syncPaymentToCloud = async (payment: Payment) => {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('payments').upsert({
      id: payment.id,
      shop_id: payment.shop_id,
      customer_id: payment.customer_id,
      customer_name: payment.customer_name,
      sale_id: payment.sale_id,
      amount: payment.amount,
      method: payment.method,
      reference_no: payment.reference_no,
      bank_name: payment.bank_name,
      screenshot_url: payment.screenshot_url,
      notes: payment.notes,
      created_at: payment.created_at
    });
    if (error) console.warn('Supabase payment sync warning:', error.message);
  } catch (err) {
    console.warn('Supabase payment sync exception:', err);
  }
};

// Helper to push ledger entry to Supabase DB
export const syncLedgerToCloud = async (entry: LedgerEntry) => {
  if (!supabase) return;
  try {
    const { error } = await supabase.from('ledger_entries').upsert({
      id: entry.id,
      shop_id: entry.shop_id,
      customer_id: entry.customer_id,
      customer_name: entry.customer_name,
      entry_type: entry.entry_type,
      sale_id: entry.sale_id,
      payment_id: entry.payment_id,
      debit: entry.debit,
      credit: entry.credit,
      running_balance: entry.running_balance,
      description: entry.description,
      entry_date: entry.entry_date,
      created_at: entry.created_at
    });
    if (error) console.warn('Supabase ledger entry sync warning:', error.message);
  } catch (err) {
    console.warn('Supabase ledger entry sync exception:', err);
  }
};

export const getStoragePersistenceInfo = () => {
  try {
    const rawData = localStorage.getItem('shop-khattabook-storage');
    if (!rawData) return { isPersisted: true, sizeBytes: 0, itemsCount: 0, mode: 'Cloud/Local' };
    const parsed = JSON.parse(rawData);
    const state = parsed.state || {};
    const totalRecords = 
      (state.customers?.length || 0) + 
      (state.products?.length || 0) + 
      (state.sales?.length || 0) + 
      (state.payments?.length || 0) + 
      (state.ledgerEntries?.length || 0);
    
    return {
      isPersisted: true,
      sizeBytes: rawData.length,
      itemsCount: totalRecords,
      lastSync: new Date().toISOString(),
      mode: isSupabaseConfigured() ? 'Supabase Cloud DB' : 'Local Persistent Engine'
    };
  } catch (err) {
    return { isPersisted: false, sizeBytes: 0, itemsCount: 0, mode: 'Error' };
  }
};

console.log(
  'Database Service Status:', 
  isSupabaseConfigured() 
    ? `Connected to Supabase Cloud DB (${supabaseUrl})` 
    : 'Operating in High-Performance Persistent Local Database Mode (LocalStorage Sync Active)'
);
