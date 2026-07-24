import { createClient, SupportedStorage } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY, IS_ENV_VALID } from '../constants/env';

import { Platform } from 'react-native';

const isWeb =
  Platform.OS === 'web' ||
  (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined');

console.log('[Supabase Storage Debug] Platform.OS:', Platform.OS, 'isWeb:', isWeb);

// Secure Store adapter for Supabase persistent auth with Web localStorage fallback
const expoSecureStoreAdapter: SupportedStorage = {
  getItem: async (key: string) => {
    if (isWeb) {
      try {
        return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      } catch (e) {
        return null;
      }
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error reading from SecureStore:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    if (isWeb) {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
      } catch (e) {}
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error writing to SecureStore:', error);
    }
  },
  removeItem: async (key: string) => {
    if (isWeb) {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      } catch (e) {}
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing from SecureStore:', error);
    }
  },
};

export const supabase = IS_ENV_VALID
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: expoSecureStoreAdapter,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Disabled for native mobile environments
      },
    })
  : (null as any);
