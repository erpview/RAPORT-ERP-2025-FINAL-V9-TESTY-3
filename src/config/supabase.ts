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

// Regular client for normal operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Service role client for admin operations
export const adminSupabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});