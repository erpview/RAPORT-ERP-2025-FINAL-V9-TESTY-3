export interface Database {
  public: {
    Tables: {
      systems: {
        Row: {
          id: string;
          name: string;
          vendor: string;
          website: string;
          description: string;
          size: string[];
          finance: boolean | null;
          production: boolean | null;
          warehouse: boolean | null;
          crm: boolean | null;
          bi: boolean | null;
          hr: boolean | null;
          cloud: boolean | null;
          onpremise: boolean | null;
          hybrid: boolean | null;
          mobile: boolean | null;
          api: boolean | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['systems']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['systems']['Insert']>;
      };
      companies: {
        Row: {
          id: string;
          name: string;
          industry: string;
          website: string;
          description: string;
          size: string;
          year_founded: number | null;
          headquarters: string | null;
          revenue_range: string | null;
          employee_count: number | null;
          erp_system: string;
          implementation_year: number | null;
          implementation_time: string | null;
          modules_implemented: string[] | null;
          roi_achieved: string | null;
          key_benefits: string[] | null;
          challenges_faced: string[] | null;
          success_factors: string[] | null;
          deployment_type: string | null;
          integration_points: string[] | null;
          customizations: string[] | null;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
          status: string;
          slug: string | null;
          meta_title: string | null;
          meta_description: string | null;
          canonical_url: string | null;
        };
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['companies']['Insert']>;
      };
    };
  };
}