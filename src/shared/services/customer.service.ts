import { supabase } from '../lib/supabase';
import { IS_ENV_VALID } from '../constants/env';
import type { Customer, CreateCustomerInput, UpdateCustomerInput } from '../types/customer.types';

export const customerService = {
  /**
   * Fetch all customers for a specific shop
   */
  async getCustomers(shopId: string): Promise<Customer[]> {
    if (!IS_ENV_VALID) return [];
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('shop_id', shopId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Fetch a single customer by ID
   */
  async getCustomerById(customerId: string): Promise<Customer | null> {
    if (!IS_ENV_VALID) return null;

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching customer details:', error);
      throw error;
    }
    return data;
  },

  /**
   * Check if a phone number already exists for a customer in the same shop
   */
  async checkPhoneExists(shopId: string, phone: string, excludeCustomerId?: string): Promise<boolean> {
    if (!IS_ENV_VALID || !phone) return false;

    let query = supabase
      .from('customers')
      .select('id')
      .eq('shop_id', shopId)
      .eq('phone', phone.trim());

    if (excludeCustomerId) {
      query = query.ne('id', excludeCustomerId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error checking duplicate customer phone:', error);
      throw error;
    }
    return Boolean(data);
  },

  /**
   * Insert a new customer profile
   */
  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    if (!IS_ENV_VALID) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase
      .from('customers')
      .insert([input])
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
    return data;
  },

  /**
   * Edit/Update an existing customer profile
   */
  async updateCustomer(customerId: string, input: UpdateCustomerInput): Promise<Customer> {
    if (!IS_ENV_VALID) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase
      .from('customers')
      .update(input)
      .eq('id', customerId)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
    return data;
  },

  /**
   * Delete a customer profile (also cascade deletes outstanding transactions automatically)
   */
  async deleteCustomer(customerId: string): Promise<void> {
    if (!IS_ENV_VALID) return;

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  /**
   * Upload an image (base64 Data URL) to the 'customer-photos' storage bucket
   */
  async uploadPhoto(
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
        .from('customer-photos')
        .upload(path, blob, {
          upsert: true,
          contentType: blob.type || 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('customer-photos')
        .getPublicUrl(path);

      return { url: publicUrl, path };
    } catch (err: any) {
      console.error('Error uploading customer photo:', err);
      throw new Error(`Failed to upload customer photo: ${err.message}`);
    }
  },
};
