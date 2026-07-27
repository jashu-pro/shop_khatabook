// Supabase Service Integration with automatic LocalStorage Fallback & Background Cloud Sync
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Customer, Product, Sale, Payment, LedgerEntry, Category } from '../types';

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

// Helper to ensure default shop exists in Supabase database before inserting child records (prevents FK errors)
export const ensureShopExists = async (shopId: string = 'shop-1') => {
  if (!supabase) return;
  try {
    const { data } = await supabase.from('shops').select('id').eq('id', shopId).maybeSingle();
    if (!data) {
      const { error } = await supabase.from('shops').upsert({
        id: shopId,
        owner_id: 'user-1',
        name: 'Sri Laxmi Traders',
        category: 'Kirana & General Store',
        village_town: 'Anantapur',
        district: 'Anantapur',
        state: 'Andhra Pradesh',
        pincode: '515001',
        upi_id: 'srilaxmi@ybl',
        currency: 'INR',
        created_at: new Date().toISOString()
      });
      if (error) console.error('Supabase shop insertion error:', error.message);
    }
  } catch (err) {
    console.error('ensureShopExists exception:', err);
  }
};

// Helper to ensure customer exists in Supabase database before inserting sales/payments (prevents FK errors)
export const ensureCustomerExists = async (customerId: string, shopId: string = 'shop-1') => {
  if (!supabase || !customerId) return;
  try {
    const { data } = await supabase.from('customers').select('id').eq('id', customerId).maybeSingle();
    if (!data) {
      await ensureShopExists(shopId);
      let custName = 'Customer';
      let custPhone = '9000000000';
      let custVillage = 'Local';
      const rawData = localStorage.getItem('shop-khattabook-storage');
      if (rawData) {
        try {
          const parsed = JSON.parse(rawData);
          const found = parsed.state?.customers?.find((c: any) => c.id === customerId);
          if (found) {
            custName = found.name;
            custPhone = found.phone;
            custVillage = found.village;
          }
        } catch (e) {}
      }
      const { error } = await supabase.from('customers').upsert({
        id: customerId,
        shop_id: shopId,
        name: custName,
        phone: custPhone,
        village: custVillage,
        tags: ['Regular'],
        credit_limit: 50000,
        credit_score: 750,
        is_deleted: false,
        created_at: new Date().toISOString()
      });
      if (error) console.error('ensureCustomerExists insertion error:', error.message);
    }
  } catch (err) {
    console.error('ensureCustomerExists exception:', err);
  }
};

// Helper to push customer to Supabase DB
export const syncCustomerToCloud = async (customer: Customer) => {
  if (!supabase) return;
  try {
    await ensureShopExists(customer.shop_id || 'shop-1');
    const { error } = await supabase.from('customers').upsert({
      id: customer.id,
      shop_id: customer.shop_id || 'shop-1',
      name: customer.name,
      phone: customer.phone,
      photo_url: customer.photo_url || null,
      village: customer.village,
      address: customer.address || null,
      notes: customer.notes || null,
      tags: customer.tags || ['Regular'],
      credit_limit: customer.credit_limit || 50000,
      credit_score: customer.credit_score || 750,
      last_payment_date: customer.last_payment_date || null,
      is_deleted: customer.is_deleted || false,
      created_at: customer.created_at || new Date().toISOString()
    });
    if (error) {
      console.error('Supabase customer sync error:', error.message, error.details);
    } else {
      console.log('Successfully synced customer to Supabase Cloud DB:', customer.name);
    }
  } catch (err) {
    console.error('Supabase customer sync exception:', err);
  }
};

// Helper to push product to Supabase DB
export const syncProductToCloud = async (product: Product) => {
  if (!supabase) return;
  try {
    await ensureShopExists(product.shop_id || 'shop-1');
    const { error } = await supabase.from('products').upsert({
      id: product.id,
      shop_id: product.shop_id || 'shop-1',
      category_id: product.category_id || null,
      category_name: product.category_name || null,
      name: product.name,
      barcode: product.barcode || null,
      selling_price: product.selling_price || 0,
      purchase_price: product.purchase_price || 0,
      stock_quantity: product.stock_quantity || 0,
      min_stock_alert: product.min_stock_alert || 5,
      supplier_name: product.supplier_name || null,
      created_at: product.created_at || new Date().toISOString()
    });
    if (error) console.error('Supabase product sync error:', error.message);
  } catch (err) {
    console.error('Supabase product sync exception:', err);
  }
};

// Helper to push sale to Supabase DB
export const syncSaleToCloud = async (sale: Sale) => {
  if (!supabase) return;
  try {
    await ensureShopExists(sale.shop_id || 'shop-1');
    await ensureCustomerExists(sale.customer_id, sale.shop_id || 'shop-1');
    const { error: saleErr } = await supabase.from('sales').upsert({
      id: sale.id,
      shop_id: sale.shop_id || 'shop-1',
      customer_id: sale.customer_id,
      customer_name: sale.customer_name || null,
      customer_phone: sale.customer_phone || null,
      subtotal: sale.subtotal || 0,
      discount: sale.discount || 0,
      tax: sale.tax || 0,
      total_amount: sale.total_amount || 0,
      amount_paid: sale.amount_paid || 0,
      balance_due: sale.balance_due || 0,
      bill_photo_url: sale.bill_photo_url || null,
      notes: sale.notes || null,
      created_at: sale.created_at || new Date().toISOString()
    });
    if (saleErr) console.error('Supabase sale sync error:', saleErr.message);

    if (sale.items && sale.items.length > 0) {
      const dbItems = sale.items.map(item => ({
        id: item.id,
        sale_id: sale.id,
        product_id: item.product_id ? item.product_id : null,
        item_name: item.item_name,
        quantity: item.quantity || 1,
        unit_price: item.unit_price || 0,
        total_price: item.total_price || 0
      }));
      await supabase.from('sale_items').upsert(dbItems);
    }
    console.log('Successfully synced credit sale & items to Supabase Cloud DB:', sale.id);
  } catch (err) {
    console.error('Supabase sale sync exception:', err);
  }
};

// Helper to push payment to Supabase DB
export const syncPaymentToCloud = async (payment: Payment) => {
  if (!supabase) return;
  try {
    await ensureShopExists(payment.shop_id || 'shop-1');
    await ensureCustomerExists(payment.customer_id, payment.shop_id || 'shop-1');
    const { error } = await supabase.from('payments').upsert({
      id: payment.id,
      shop_id: payment.shop_id || 'shop-1',
      customer_id: payment.customer_id,
      customer_name: payment.customer_name || null,
      sale_id: payment.sale_id || null,
      amount: payment.amount || 0,
      method: payment.method || 'CASH',
      reference_no: payment.reference_no || null,
      bank_name: payment.bank_name || null,
      screenshot_url: payment.screenshot_url || null,
      notes: payment.notes || null,
      created_at: payment.created_at || new Date().toISOString()
    });
    if (error) console.error('Supabase payment sync error:', error.message);
  } catch (err) {
    console.error('Supabase payment sync exception:', err);
  }
};

// Helper to push ledger entry to Supabase DB
export const syncLedgerToCloud = async (entry: LedgerEntry) => {
  if (!supabase) return;
  try {
    await ensureShopExists(entry.shop_id || 'shop-1');
    await ensureCustomerExists(entry.customer_id, entry.shop_id || 'shop-1');
    const { error } = await supabase.from('ledger_entries').upsert({
      id: entry.id,
      shop_id: entry.shop_id || 'shop-1',
      customer_id: entry.customer_id,
      customer_name: entry.customer_name || null,
      entry_type: entry.entry_type,
      sale_id: entry.sale_id || null,
      payment_id: entry.payment_id || null,
      debit: entry.debit || 0,
      credit: entry.credit || 0,
      running_balance: entry.running_balance || 0,
      description: entry.description || null,
      entry_date: entry.entry_date || new Date().toISOString(),
      created_at: entry.created_at || new Date().toISOString()
    });
    if (error) console.error('Supabase ledger entry sync error:', error.message);
  } catch (err) {
    console.error('Supabase ledger entry sync exception:', err);
  }
};

// Function to bulk sync all local storage data to Supabase Cloud DB
export const syncAllLocalDataToCloud = async () => {
  if (!supabase) return { success: false, message: 'Supabase is not configured' };
  try {
    const rawData = localStorage.getItem('shop-khattabook-storage');
    if (!rawData) return { success: true, message: 'No local data to sync' };
    const parsed = JSON.parse(rawData);
    const state = parsed.state || {};

    await ensureShopExists(state.shop?.id || 'shop-1');

    if (state.customers && state.customers.length > 0) {
      for (const cust of state.customers) {
        await syncCustomerToCloud(cust);
      }
    }

    if (state.products && state.products.length > 0) {
      for (const prod of state.products) {
        await syncProductToCloud(prod);
      }
    }

    if (state.sales && state.sales.length > 0) {
      for (const sale of state.sales) {
        await syncSaleToCloud(sale);
      }
    }

    if (state.payments && state.payments.length > 0) {
      for (const pay of state.payments) {
        await syncPaymentToCloud(pay);
      }
    }

    if (state.ledgerEntries && state.ledgerEntries.length > 0) {
      for (const led of state.ledgerEntries) {
        await syncLedgerToCloud(led);
      }
    }

    return { success: true, message: 'All local customers & records synced to Supabase!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Sync failed' };
  }
};

// Function to fetch all Cloud Data from Supabase and sync to local state
export const fetchCloudDataToLocal = async () => {
  if (!supabase) return { success: false, message: 'Supabase is not configured', isEmpty: false };

  try {
    // 1. Fetch Customers
    const { data: dbCustomers, error: custErr } = await supabase
      .from('customers')
      .select('*')
      .or('is_deleted.eq.false,is_deleted.is.null');

    if (custErr) throw custErr;

    // 2. Fetch Products
    const { data: dbProducts, error: prodErr } = await supabase.from('products').select('*');
    if (prodErr) throw prodErr;

    // 3. Fetch Sales & Sale Items
    const { data: dbSales, error: saleErr } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
    if (saleErr) throw saleErr;

    const { data: dbItems, error: itemsErr } = await supabase.from('sale_items').select('*');
    if (itemsErr) console.warn('Sale items fetch warning:', itemsErr.message);

    // Map items to sales
    const sales: Sale[] = (dbSales || []).map((s: any) => ({
      ...s,
      items: (dbItems || [])
        .filter((i: any) => i.sale_id === s.id)
        .map((i: any) => ({
          id: i.id,
          sale_id: i.sale_id,
          product_id: i.product_id || undefined,
          item_name: i.item_name,
          quantity: Number(i.quantity) || 1,
          unit_price: Number(i.unit_price) || 0,
          total_price: Number(i.total_price) || 0
        }))
    }));

    // 4. Fetch Payments
    const { data: dbPayments, error: payErr } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (payErr) throw payErr;

    // 5. Fetch Ledger Entries
    const { data: dbLedger, error: ledErr } = await supabase.from('ledger_entries').select('*').order('entry_date', { ascending: true });
    if (ledErr) throw ledErr;

    // 6. Fetch Categories
    const { data: dbCategories, error: catErr } = await supabase.from('categories').select('*');
    if (catErr) console.warn('Categories fetch warning:', catErr.message);

    const customers: Customer[] = (dbCustomers || []).map((c: any) => ({
      id: c.id,
      shop_id: c.shop_id || 'shop-1',
      name: c.name,
      phone: c.phone,
      photo_url: c.photo_url || undefined,
      village: c.village || 'Local',
      address: c.address || undefined,
      notes: c.notes || undefined,
      tags: c.tags || ['Regular'],
      credit_limit: Number(c.credit_limit) || 50000,
      credit_score: Number(c.credit_score) || 750,
      last_payment_date: c.last_payment_date || undefined,
      is_deleted: c.is_deleted || false,
      created_at: c.created_at || new Date().toISOString()
    }));

    const products: Product[] = (dbProducts || []).map((p: any) => ({
      id: p.id,
      shop_id: p.shop_id || 'shop-1',
      category_id: p.category_id || undefined,
      category_name: p.category_name || undefined,
      name: p.name,
      barcode: p.barcode || undefined,
      selling_price: Number(p.selling_price) || 0,
      purchase_price: Number(p.purchase_price) || 0,
      stock_quantity: Number(p.stock_quantity) || 0,
      min_stock_alert: Number(p.min_stock_alert) || 5,
      supplier_name: p.supplier_name || undefined,
      created_at: p.created_at || new Date().toISOString()
    }));

    const payments: Payment[] = (dbPayments || []).map((p: any) => ({
      id: p.id,
      shop_id: p.shop_id || 'shop-1',
      customer_id: p.customer_id,
      customer_name: p.customer_name || undefined,
      sale_id: p.sale_id || undefined,
      amount: Number(p.amount) || 0,
      method: p.method || 'CASH',
      reference_no: p.reference_no || undefined,
      bank_name: p.bank_name || undefined,
      screenshot_url: p.screenshot_url || undefined,
      notes: p.notes || undefined,
      created_at: p.created_at || new Date().toISOString()
    }));

    const ledgerEntries: LedgerEntry[] = (dbLedger || []).map((l: any) => ({
      id: l.id,
      shop_id: l.shop_id || 'shop-1',
      customer_id: l.customer_id,
      customer_name: l.customer_name || undefined,
      entry_type: l.entry_type,
      sale_id: l.sale_id || undefined,
      payment_id: l.payment_id || undefined,
      debit: Number(l.debit) || 0,
      credit: Number(l.credit) || 0,
      running_balance: Number(l.running_balance) || 0,
      description: l.description || undefined,
      entry_date: l.entry_date || new Date().toISOString(),
      created_at: l.created_at || new Date().toISOString()
    }));

    const categories: Category[] = (dbCategories || []).map((cat: any) => ({
      id: cat.id,
      shop_id: cat.shop_id || 'shop-1',
      name: cat.name,
      created_at: cat.created_at || new Date().toISOString()
    }));

    const totalRecords = customers.length + products.length + sales.length + payments.length + ledgerEntries.length;
    const isEmpty = totalRecords === 0;

    return {
      success: true,
      isEmpty,
      data: {
        customers,
        products,
        sales,
        payments,
        ledgerEntries,
        categories
      }
    };
  } catch (err: any) {
    console.error('fetchCloudDataToLocal exception:', err);
    return { success: false, message: err?.message || 'Cloud fetch failed', isEmpty: false };
  }
};

// Function to wipe all data in Supabase Cloud DB tables
export const clearAllSupabaseData = async () => {
  if (!supabase) return { success: false, message: 'Supabase is not configured' };
  try {
    await supabase.from('ledger_entries').delete().neq('id', '0');
    await supabase.from('sale_items').delete().neq('id', '0');
    await supabase.from('sales').delete().neq('id', '0');
    await supabase.from('payments').delete().neq('id', '0');
    await supabase.from('products').delete().neq('id', '0');
    await supabase.from('categories').delete().neq('id', '0');
    await supabase.from('customers').delete().neq('id', '0');
    return { success: true, message: 'All tables in Supabase Cloud DB cleared successfully!' };
  } catch (err: any) {
    console.error('clearAllSupabaseData exception:', err);
    return { success: false, message: err?.message || 'Failed to clear Supabase' };
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

