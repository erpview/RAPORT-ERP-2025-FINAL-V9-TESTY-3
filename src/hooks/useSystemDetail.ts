import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { SystemDetailData, SystemDetailState } from '../types/systemDetail';

export const useSystemDetail = (systemName: string): SystemDetailState => {
  const [state, setState] = useState<SystemDetailState>({
    system: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchSystemDetail = async () => {
      try {
        // Convert URL-friendly name back to original name
        const decodedName = decodeURIComponent(systemName.replace(/-/g, ' '));
        
        const { data, error } = await supabase
          .from('systems')
          .select(`
            *,
            features:system_features(name),
            industries:system_industries(name),
            pricing:system_pricing(*)
          `)
          .eq('name', decodedName)
          .single();

        if (error) throw error;

        if (!data) {
          setState({
            system: null,
            loading: false,
            error: 'System not found',
          });
          return;
        }

        // Transform the data into the expected format
        const systemData: SystemDetailData = {
          ...data,
          features: data.features?.map((f: any) => f.name) || [],
          targetIndustries: data.industries?.map((i: any) => i.name) || [],
          pricing: data.pricing?.[0] || null,
        };

        setState({
          system: systemData,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          system: null,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        });
      }
    };

    fetchSystemDetail();
  }, [systemName]);

  return state;
};
