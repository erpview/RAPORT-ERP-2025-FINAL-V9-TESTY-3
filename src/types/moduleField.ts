export interface ModuleField {
  id: number;
  module_id: number;
  name: string;
  field_key: string;
  field_type: 'text' | 'number' | 'boolean' | 'date' | 'multiselect';
  is_required: boolean;
  order_index: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}
