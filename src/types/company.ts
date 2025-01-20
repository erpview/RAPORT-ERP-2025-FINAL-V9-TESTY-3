export interface Company {
  id?: string;
  name: string;
  street: string;
  postal_code: string;
  city: string;
  phone: string;
  website?: string;
  email: string;
  nip: string;
  logo_url?: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  slug: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  module_values?: Record<string, any>;
  company_field_values?: Array<{
    id: string;
    field_id: string;
    value: string;
    created_at?: string;
    updated_at?: string;
  }>;
}
