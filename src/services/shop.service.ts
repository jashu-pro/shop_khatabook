import { supabase } from '../lib/supabase';
import { IS_ENV_VALID } from '../constants/env';
import type { Shop, CreateShopInput } from '../types/shop.types';

export const shopService = {
  /**
   * Fetch shop details for a specific owner
   */
  async getShopByOwner(ownerId: string): Promise<Shop | null> {
    if (!IS_ENV_VALID) return null;
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching shop:', error);
      throw error;
    }
    return data;
  },

  /**
   * Check if a shop code already exists
   */
  async checkShopCodeExists(shopCode: string): Promise<boolean> {
    if (!IS_ENV_VALID) return false;
    const { data, error } = await supabase
      .from('shops')
      .select('id')
      .eq('shop_code', shopCode)
      .maybeSingle();

    if (error) {
      console.error('Error checking shop code:', error);
      throw error;
    }
    return Boolean(data);
  },

  /**
   * Create a new shop configuration
   */
  async createShop(shopData: CreateShopInput): Promise<Shop> {
    if (!IS_ENV_VALID) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase.from('shops').insert([shopData]).select().single();

    if (error) {
      console.error('Error inserting shop:', error);
      throw error;
    }
    return data;
  },

  /**
   * Upload an image (base64 Data URL) to Supabase Storage bucket
   * Stores files in the folder structure: bucket/ownerId/fileName (e.g. logo.jpg)
   */
  async uploadImage(
    bucket: 'owner-photos' | 'shop-logos',
    ownerId: string,
    fileName: string,
    base64Data: string
  ): Promise<{ url: string; path: string } | null> {
    if (!IS_ENV_VALID) return null;
    if (!base64Data) return null;

    // If the input is already a HTTP URL (e.g. social login photo), return it directly
    if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
      return { url: base64Data, path: base64Data };
    }

    try {
      // Decode data URL to blob
      const res = await fetch(base64Data);
      const blob = await res.blob();

      const path = `${ownerId}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, blob, {
        upsert: true,
        contentType: blob.type || 'image/jpeg',
      });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);

      return { url: publicUrl, path };
    } catch (err: any) {
      console.error(`Error uploading to bucket ${bucket}:`, err);
      throw new Error(`Failed to upload photo: ${err.message}`);
    }
  },
};
