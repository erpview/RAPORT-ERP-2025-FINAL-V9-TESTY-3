import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

export type SystemField = {
  id: string;
  module_id: string;
  name: string;
  field_key: string;
  field_type: string;
  description: string | null;
  is_required: boolean;
  options: string[] | null;
  order_index: number;
};

export type SystemModule = {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
  is_public: boolean;
};

export type SystemFieldValue = {
  id: string;
  system_id: string;
  field_id: string;
  value: string;
};

export function useSystemFields() {
  const [modules, setModules] = useState<SystemModule[]>([]);
  const [fields, setFields] = useState<SystemField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModulesAndFields();
  }, []);

  const fetchModulesAndFields = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch active modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('system_modules')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (modulesError) {
        console.error('Error fetching modules:', modulesError);
        throw modulesError;
      }

      console.log('useSystemFields - Raw modules data from DB:', modulesData);
      
      // Verify each module has the is_public field
      const modulesWithPublicField = modulesData?.map(module => {
        if (typeof module.is_public !== 'boolean') {
          console.warn(`Module "${module.name}" has invalid is_public value:`, module.is_public);
          // Default to false if is_public is not a boolean
          return { ...module, is_public: false };
        }
        return module;
      });

      console.log('useSystemFields - Processed modules:', modulesWithPublicField);

      // Fetch fields for active modules
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('system_fields')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (fieldsError) throw fieldsError;

      // Debug log
      console.log('Loaded fields:', fieldsData?.map(f => ({ id: f.id, name: f.name, key: f.field_key })));

      setModules(modulesWithPublicField);
      setFields(fieldsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching system fields:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFieldsByModule = (moduleId: string) => {
    return fields.filter(field => field.module_id === moduleId);
  };

  const getModuleFields = () => {
    return modules.map(module => ({
      module,
      fields: getFieldsByModule(module.id)
    }));
  };

  const getFieldValues = async (systemId: string) => {
    try {
      const { data, error } = await supabase
        .from('system_field_values')
        .select('*')
        .eq('system_id', systemId);

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error fetching field values:', err);
      return [];
    }
  };

  const saveFieldValues = async (systemId: string, values: Record<string, string>) => {
    try {
      const upserts = Object.entries(values).map(([fieldId, value]) => ({
        system_id: systemId,
        field_id: fieldId,
        value: value
      }));

      const { error } = await supabase
        .from('system_field_values')
        .upsert(upserts, {
          onConflict: 'system_id,field_id'
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving field values:', err);
      throw err;
    }
  };

  return {
    modules,
    fields,
    loading,
    error,
    getFieldsByModule,
    getModuleFields,
    getFieldValues,
    saveFieldValues,
    refresh: fetchModulesAndFields
  };
}
