import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupportedStorage } from '@supabase/supabase-js';

import { getPublicEnv } from './env';

const { supabaseUrl, supabaseAnonKey } = getPublicEnv();

const memoryStorage: SupportedStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const authStorage: SupportedStorage =
  typeof window === "undefined" ? memoryStorage : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: typeof window !== "undefined",
    persistSession: typeof window !== "undefined",
    detectSessionInUrl: false,
  },
});
