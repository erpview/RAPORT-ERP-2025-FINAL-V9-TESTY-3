import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export interface CompanyModule {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyField {
  id: string;
  module_id: string;
  name: string;
  field_key: string;
  field_type: string;
  description: string | null;
  is_required: boolean;
  options: any;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyFieldValue {
  id: string;
  company_id: string;
  field_id: string;
  value: string;
  created_at?: string;
  updated_at?: string;
}

export function useCompanyFields() {
  const [modules, setModules] = useState<CompanyModule[]>([]);
  const [fields, setFields] = useState<CompanyField[]>([]);
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
        .from('company_modules')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (modulesError) {
        console.error('Error fetching modules:', modulesError);
        throw modulesError;
      }

      setModules(modulesData || []);

      // Fetch active fields for active modules
      if (modulesData && modulesData.length > 0) {
        const { data: fieldsData, error: fieldsError } = await supabase
          .from('company_fields')
          .select('*')
          .eq('is_active', true)
          .in('module_id', modulesData.map(m => m.id))
          .order('order_index');

        if (fieldsError) {
          console.error('Error fetching fields:', fieldsError);
          throw fieldsError;
        }

        setFields(fieldsData || []);
      } else {
        setFields([]);
      }
    } catch (error) {
      console.error('Error in fetchModulesAndFields:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
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

  const getFieldValues = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('company_field_values')
        .select('*')
        .eq('company_id', companyId);

      if (error) throw error;

      return data as CompanyFieldValue[];
    } catch (err) {
      console.error('Error fetching company field values:', err);
      return [];
    }
  };

  const saveFieldValues = async (companyId: string, values: Record<string, string>) => {
    try {
      const upserts = Object.entries(values).map(([fieldId, value]) => ({
        company_id: companyId,
        field_id: fieldId,
        value: value
      }));

      const { error } = await supabase
        .from('company_field_values')
        .upsert(upserts, {
          onConflict: 'company_id,field_id'
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error saving company field values:', err);
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
