import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Company } from '../types/company';
import { fetchCompanies } from '../services/companiesService';

interface CompaniesCatalogProps {
  companies: Company[];
}

export const CompaniesCatalog: React.FC<CompaniesCatalogProps> = ({ companies }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = companies.filter(company => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Helper function to safely check if a string includes the search term
    const includesSearch = (value: string | undefined | null) => {
      return value?.toLowerCase().includes(searchLower) || false;
    };

    // Check all basic fields
    const basicFieldsMatch = 
      includesSearch(company.name) ||
      includesSearch(company.street) ||
      includesSearch(company.postal_code) ||
      includesSearch(company.city) ||
      includesSearch(company.phone) ||
      includesSearch(company.website) ||
      includesSearch(company.email) ||
      includesSearch(company.nip) ||
      includesSearch(company.description) ||
      includesSearch(company.meta_title) ||
      includesSearch(company.meta_description);

    // Check company_field_values
    const fieldValuesMatch = company.company_field_values?.some(field => {
      // Convert array values to string for searching
      const fieldValue = Array.isArray(field.value) 
        ? field.value.join(' ') 
        : field.value;
      return includesSearch(fieldValue);
    });

    // Check module_values if they exist
    const moduleValuesMatch = company.module_values ? 
      Object.values(company.module_values).some(value => {
        if (Array.isArray(value)) {
          return value.some(v => typeof v === 'string' && includesSearch(v));
        }
        return typeof value === 'string' && includesSearch(value);
      }) : false;

    return basicFieldsMatch || fieldValuesMatch || moduleValuesMatch;
  });

  return (
    <div>
      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#86868b]" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Szukaj we wszystkich polach firmy..."
            className="block w-full pl-10 pr-3 py-2 border border-[#d2d2d7] rounded-xl bg-white placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0066cc] focus:border-transparent transition-shadow text-[15px]"
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.map((company) => (
          <Link
            key={company.id}
            to={`/firmy-it/${company.slug}`}
            className="block bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#d2d2d7]/30 transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:-translate-y-1"
          >
            <div className="p-6">
              {company.logo_url && (
                <div className="mb-4 flex justify-center">
                  <img 
                    src={company.logo_url} 
                    alt={`${company.name} logo`}
                    className="h-16 object-contain"
                  />
                </div>
              )}
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-4">{company.name}</h3>
              <div className="text-sm text-[#424245] mb-4">
                <p><span className="font-medium">Adres:</span> {company.street}</p>
                <p className="ml-[45px] mb-4">{company.postal_code} {company.city}</p>
                {company.phone && <p><span className="font-medium">Tel:</span> {company.phone}</p>}
                {company.email && <p><span className="font-medium">Email:</span> {company.email}</p>}
                {company.nip && <p><span className="font-medium">NIP:</span> {company.nip}</p>}
              </div>
              {company.description && (
                <p className="text-[#424245] line-clamp-3">{company.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nie znaleziono firm spełniających kryteria wyszukiwania.</p>
        </div>
      )}
    </div>
  );
};

export const CompaniesCatalogContainer: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await fetchCompanies();
        setCompanies(data);
      } catch (error) {
        console.error('Error loading companies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <CompaniesCatalog companies={companies} />;
};
