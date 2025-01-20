import { supabase, adminSupabase } from '../config/supabase';
import { Company } from '../types/company';

const COMPANY_SELECT = `
  id,
  name,
  street,
  postal_code,
  city,
  phone,
  website,
  email,
  nip,
  logo_url,
  description,
  created_at,
  created_by,
  updated_at,
  updated_by,
  status,
  slug,
  meta_title,
  meta_description,
  canonical_url,
  module_values
`;

export const fetchCompanies = async (): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      company_field_values (
        id,
        field_id,
        value,
        created_at,
        updated_at
      )
    `)
    .eq('status', 'published')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const fetchCompanyBySlug = async (slug: string): Promise<Company | null> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No company found
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching company by slug:', error);
    throw error;
  }
};

export const fetchAdminCompanies = async (userId?: string): Promise<Company[]> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // Use adminSupabase if user is admin, otherwise use regular client
    const client = userData.user.app_metadata?.role === 'admin' ? adminSupabase : supabase;

    let query = client
      .from('companies')
      .select('*')
      .order('name');

    // If userId is provided (editor), only fetch their companies
    if (userId) {
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admin companies:', error);
    throw error;
  }
};

export const saveCompanyFieldValues = async (companyId: string, moduleValues: Record<string, any>) => {
  try {
    // First, delete existing field values for this company
    const { error: deleteError } = await supabase
      .from('company_field_values')
      .delete()
      .eq('company_id', companyId);

    if (deleteError) throw deleteError;

    // Prepare new field values
    const fieldValues = [];
    for (const [moduleId, fields] of Object.entries(moduleValues)) {
      for (const [fieldKey, value] of Object.entries(fields as Record<string, any>)) {
        // Get the field_id for this moduleId and fieldKey
        const { data: fieldData, error: fieldError } = await supabase
          .from('company_fields')
          .select('id')
          .eq('module_id', moduleId)
          .eq('field_key', fieldKey)
          .single();

        if (fieldError) continue; // Skip if field not found
        if (!fieldData) continue;

        fieldValues.push({
          company_id: companyId,
          field_id: fieldData.id,
          value: value?.toString() || ''
        });
      }
    }

    // Insert new field values if there are any
    if (fieldValues.length > 0) {
      const { error: insertError } = await supabase
        .from('company_field_values')
        .insert(fieldValues);

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error saving company field values:', error);
    throw error;
  }
};

export const createCompany = async (companyData: Omit<Company, 'id'>): Promise<Company> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  // Check if user is admin from app_metadata
  const isAdmin = userData.user.app_metadata?.role === 'admin';

  // Use appropriate client based on role
  const client = isAdmin ? adminSupabase : supabase;

  // Extract module_values before creating company
  const { module_values, ...companyFields } = companyData;

  try {
    const { data, error } = await client
      .from('companies')
      .insert([{
        ...companyFields,
        created_by: userData.user.id,
        updated_by: userData.user.id
      }])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    // Save module field values if present
    if (module_values && Object.keys(module_values).length > 0) {
      await saveCompanyFieldValues(data.id, module_values);
    }

    return data;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

export const updateCompany = async (id: string, companyData: Partial<Company>): Promise<Company> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  // Extract module_values before updating company
  const { module_values, ...companyFields } = companyData;

  try {
    const { data, error } = await supabase
      .from('companies')
      .update({
        ...companyFields,
        updated_by: userData.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from update');

    // Save module field values if present
    if (module_values && Object.keys(module_values).length > 0) {
      await saveCompanyFieldValues(data.id, module_values);
    }

    return data;
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

export const deleteCompany = async (id: string): Promise<void> => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  // Use adminSupabase if user is admin
  const client = userData.user.app_metadata?.role === 'admin' ? adminSupabase : supabase;

  const { error } = await client
    .from('companies')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const updateCompanyStatus = async (id: string, status: 'published' | 'draft' | 'archived'): Promise<Company> => {
  const { data, error } = await supabase
    .from('companies')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(COMPANY_SELECT)
    .single();

  if (error) throw error;
  return data;
};
