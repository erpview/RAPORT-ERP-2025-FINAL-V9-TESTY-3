export interface SurveyForm {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'inactive';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SurveyModule {
  id: string;
  form_id: string;
  name: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface SurveyField {
  id: string;
  module_id: string;
  name: string;
  field_type: 'text' | 'number' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'textarea' | 'rating' | 'email' | 'url' | 'nps' | 'year';
  field_key?: string;
  description?: string | null;
  options?: string[] | null;
  is_required: boolean;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface SurveyAssignment {
  id: string;
  form_id: string;
  target_type: 'system' | 'company';
  target_id: string;
  created_at: string;
  updated_at: string;
}

export interface SurveyResponse {
  id: string;
  form_id: string;
  assignment_id: string;
  user_id: string;
  responses: Record<string, any>;
  created_at: string;
  updated_at: string;
}
