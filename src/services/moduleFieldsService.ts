import { supabase } from '../config/supabase';
import { ModuleField } from '../types/moduleField';

export const fetchModuleFields = async (moduleId?: number): Promise<ModuleField[]> => {
  try {
    let query = supabase
      .from('company_fields')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (moduleId) {
      query = query.eq('module_id', moduleId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching module fields:', error);
    throw error;
  }
};
