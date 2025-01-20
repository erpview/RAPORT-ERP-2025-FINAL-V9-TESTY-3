import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminSupabase } from '../config/supabase';
import SystemsCatalog from '../components/SystemsCatalog';
import { SEOHead } from '../components/seo/SEOHead';

interface System {
  id: number;
  name: string;
  description?: string;
  // Add other system properties as needed
}

export const Systems: React.FC = () => {
  const [systems, setSystems] = useState<System[]>([]);

  useEffect(() => {
    const fetchSystems = async () => {
      const { data } = await adminSupabase.from('systems').select('*');
      setSystems(data || []);  // Use empty array as fallback if data is null
    };
    fetchSystems();
  }, []);

  return (
    <>
      <SEOHead pageIdentifier="/systemy-erp" />
      <div className="min-h-screen bg-[#F5F5F7] py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-[#1d1d1f] mb-4">Systemy ERP w Polsce</h1>
            <p className="text-[21px] leading-relaxed text-[#86868b]">
              Kompleksowy przegląd i porównanie systemów ERP dostępnych na polskim rynku
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#d2d2d7]/30 overflow-hidden">
            <div className="p-8 sm:p-12">
              <SystemsCatalog />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};