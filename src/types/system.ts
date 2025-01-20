export type SystemStatus = 'draft' | 'pending' | 'published' | 'rejected';

export interface System {
  id: string;
  name: string;
  vendor: string;
  website: string;
  description: string;
  size: string[];
  
  // Basic modules
  finance?: boolean;
  hr?: boolean;
  scm?: boolean;
  production?: boolean;
  crm?: boolean;
  warehouse?: boolean;
  purchasing?: boolean;
  
  // Special modules
  project?: boolean;
  bi?: boolean;
  grc?: boolean;
  dam?: boolean;
  cmms?: boolean;
  plm?: boolean;
  rental?: boolean;
  ecommerce?: boolean;
  
  // Connectivity modules
  edi?: boolean;
  iot?: boolean;
  api?: boolean;
  dms?: boolean;
  mobile?: boolean;
  portals?: boolean;
  
  // Technical aspects
  customization_level?: string;
  update_frequency?: string;
  supported_databases?: string[];
  multilingual?: boolean;
  max_users?: number | null;
  concurrent_users?: number | null;
  
  // Detailed information
  pricing_model?: string[];
  implementation_time?: string;
  target_industries?: string[];
  languages?: string[];
  support_options?: string[];
  training_options?: string[];
  integration_options?: string[];
  security_features?: string[];
  compliance_standards?: string[];
  backup_options?: string[];
  reporting_features?: string[];
  deployment_type?: string[];

  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  status?: SystemStatus;
  review_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  change_notes?: string;
}