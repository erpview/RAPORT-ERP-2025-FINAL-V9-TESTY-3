import { supabase } from '../config/supabase';
import { Module } from '../types/module';

export const fetchActiveModules = async (): Promise<Module[]> => {
  try {
    const { data, error } = await supabase
      .from('company_modules')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching active modules:', error);
    throw error;
  }
};
