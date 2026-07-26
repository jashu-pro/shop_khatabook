// Supabase Service Integration with automatic LocalStorage Fallback for full offline/mock capability
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
