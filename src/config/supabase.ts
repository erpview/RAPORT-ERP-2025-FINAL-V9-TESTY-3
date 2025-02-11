import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import dotenv from 'dotenv';

// Load environment variables in Node.js environment
if (typeof process !== 'undefined' && process.env) {
  dotenv.config();
}

// In Node.js environment (scripts), use process.env
// In browser environment (Vite), use import.meta.env
const getEnvVar = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');
const serviceRoleKey = getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create singleton instances
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;
let adminSupabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

// Regular client for normal operations
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
})();

// Service role client for admin operations
export const adminSupabase = (() => {
  if (!adminSupabaseInstance) {
    adminSupabaseInstance = createClient<Database>(supabaseUrl, serviceRoleKey || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return adminSupabaseInstance;
})();