import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCompanyBySlug } from '../services/companiesService';
import { fetchActiveModules } from '../services/modulesService';
import { fetchModuleFields } from '../services/moduleFieldsService';
import { Company } from '../types/company';
import { Module } from '../types/module';
import { ModuleField } from '../types/moduleField';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';
import { MultiSelectValue } from '../components/ui/MultiSelectValue';

export const CompanyDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [fields, setFields] = useState<ModuleField[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const isAdmin = user?.user_metadata?.role === 'admin';

  useEffect(() => {
    window.scrollTo(0, 0);
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      navigate('/login', { state: { from: `/firmy-it/${slug}` } });
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [companyData, modulesData, fieldsData] = await Promise.all([
          fetchCompanyBySlug(slug || ''),
          user ? fetchActiveModules() : Promise.resolve([]),
          user ? fetchModuleFields() : Promise.resolve([])
        ]);

        // Fetch field values for the company
        if (companyData && user) {
          // First get all active company fields
          const { data: companyFields, error: fieldsError } = await supabase
            .from('company_fields')
            .select(`
              id,
              module_id,
              name,
              field_key,
              field_type,
              description,
              is_required,
              options,
              order_index,
              is_active
            `)
            .eq('is_active', true)
            .order('order_index');

          if (fieldsError) {
            console.error('Error fetching company fields:', fieldsError);
          }

          if (companyFields) {
            // Then get all field values for this company
            const { data: fieldValues, error: valuesError } = await supabase
              .from('company_field_values')
              .select(`
                field_id,
                value
              `)
              .eq('company_id', companyData.id);

            if (valuesError) {
              console.error('Error fetching field values:', valuesError);
            }

            // Create a map of field values by field_id
            const valueMap = new Map(
              fieldValues?.map(fv => [fv.field_id, fv.value]) || []
            );

            // Group fields by module and include their values
            companyData.module_values = companyFields.reduce((acc: any, field: any) => {
              const moduleId = field.module_id;
              const fieldKey = field.field_key;
              
              if (moduleId && fieldKey) {
                if (!acc[moduleId]) {
                  acc[moduleId] = {};
                }
                
                // Get value from the valueMap, or use default based on field type
                const value = valueMap.get(field.id);
                let fieldValue;

                if (value !== undefined) {
                  switch (field.field_type) {
                    case 'boolean':
                      fieldValue = value.toLowerCase() === 'true';
                      break;
                    case 'number':
                      fieldValue = Number(value) || 0;
                      break;
                    default:
                      fieldValue = value;
                  }
                } else {
                  // Set default value if no value exists
                  switch (field.field_type) {
                    case 'boolean':
                      fieldValue = false;
                      break;
                    case 'number':
                      fieldValue = 0;
                      break;
                    default:
                      fieldValue = '';
                  }
                }
                
                acc[moduleId][fieldKey] = fieldValue;
              }
              return acc;
            }, {});
          }
        }

        setCompany(companyData);
        setModules(modulesData);
        setFields(fieldsData);
      } catch (error) {
        console.error('Error loading company details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && slug) {
      loadData();
    }
  }, [slug, user, authLoading]);

  const renderFieldValue = (field: any, value: any) => {
    if (!value) return 'Brak wartości';

    switch (field.field_type) {
      case 'boolean':
        return value === 'true' ? 'Tak' : 'Nie';
      case 'multiselect':
        const values = value.split(',').map((v: string) => v.trim());
        return (
          <div className="flex flex-col">
            {values.map((v: string, index: number) => (
              <div key={index} className="mb-2">
                <MultiSelectValue value={v} />
              </div>
            ))}
          </div>
        );
      default:
        return value;
    }
  };

  if (loading || authLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!company) {
    return <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-red-600">Firma nie została znaleziona</h1>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Company Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="order-2 md:order-1">
              <h1 className="text-3xl font-bold text-center md:text-left text-[#1d1d1f] mb-2">
                {company.name}
              </h1>
              {company.category && (
                <div className="text-[#424245] text-center md:text-left">
                  {company.category}
                </div>
              )}
            </div>
            {company.logo_url && (
              <div className="mb-4 md:mb-0 order-1 md:order-2">
                <img
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  className="h-24 md:h-20 object-contain mx-auto md:mx-0"
                />
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#d2d2d7]/30 p-6 transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:-translate-y-1">
              <div className="border-b border-[#d2d2d7]/30 pb-4 mb-4">
                <h2 className="text-xl font-semibold text-[#1d1d1f]">Informacje kontaktowe</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-[#1d1d1f]">Adres:</span>{' '}
                  <span className="text-[#424245]">{company.street}</span>
                </div>
                <div>
                  <span className="font-medium text-[#1d1d1f]">Kod pocztowy:</span>{' '}
                  <span className="text-[#424245]">{company.postal_code}</span>
                </div>
                <div>
                  <span className="font-medium text-[#1d1d1f]">Miasto:</span>{' '}
                  <span className="text-[#424245]">{company.city}</span>
                </div>
                <div>
                  <span className="font-medium text-[#1d1d1f]">Telefon:</span>{' '}
                  <span className="text-[#424245]">{company.phone}</span>
                </div>
                <div>
                  <span className="font-medium text-[#1d1d1f]">Email:</span>{' '}
                  <span className="text-[#424245]">{company.email}</span>
                </div>
                <div>
                  <span className="font-medium text-[#1d1d1f]">NIP:</span>{' '}
                  <span className="text-[#424245]">{company.nip}</span>
                </div>
                {company.website && (
                  <div>
                    <span className="font-medium text-[#1d1d1f]">Strona WWW:</span>{' '}
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[#0066cc] hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#d2d2d7]/30 p-6 transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:-translate-y-1">
              <div className="border-b border-[#d2d2d7]/30 pb-4 mb-4">
                <h2 className="text-xl font-semibold text-[#1d1d1f]">O firmie</h2>
              </div>
              <p className="text-[#424245] whitespace-pre-wrap">{company.description}</p>
            </div>
          </div>

          {/* Modules Section - Only visible for logged-in users */}
          {user && modules.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Informacje dodatkowe</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...modules]
                  .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                  .map(module => {
                    const moduleFields = fields.filter(field => field.module_id === module.id);
                    const moduleValues = company.module_values?.[module.id] || {};

                    // Check if module has any fields with values
                    const hasAnyValues = moduleFields.some(field => {
                      const value = moduleValues[field.field_key];
                      return value !== undefined && value !== null && value !== '';
                    });

                    // Skip module if it has no fields with values
                    if (!hasAnyValues) {
                      return null;
                    }

                    return (
                      <div 
                        key={module.id} 
                        className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#d2d2d7]/30 p-6 transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:-translate-y-1"
                      >
                        <div className="border-b border-[#d2d2d7]/30 pb-4 mb-4">
                          <h3 className="text-xl font-semibold text-[#1d1d1f]">{module.name}</h3>
                        </div>
                        <div className="space-y-4">
                          {moduleFields
                            .sort((a, b) => a.order_index - b.order_index)
                            .map(field => {
                              const value = moduleValues[field.field_key];
                              // Skip fields without values
                              if (value === undefined || value === null || value === '') {
                                return null;
                              }
                              return (
                                <div key={field.id} className="group">
                                  {field.description && (
                                    <p className="text-[13px] text-[#86868b] mb-1">{field.description}</p>
                                  )}
                                  <div>
                                    <span className="font-medium text-[#1d1d1f]">{field.name}:</span>{' '}
                                    {field.field_type === 'multiselect' ? (
                                      <div className="mt-2">
                                        {renderFieldValue(field, value)}
                                      </div>
                                    ) : (
                                      <span className="text-[#424245]">
                                        {renderFieldValue(field, value)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* SEO Section - Only visible for admin users */}
          {isAdmin && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-semibold mb-6">Informacje SEO</h2>
              <div className="space-y-4">
                <p><span className="font-medium">Meta tytuł:</span> {company.meta_title}</p>
                <p><span className="font-medium">Meta opis:</span> {company.meta_description}</p>
                <p><span className="font-medium">URL kanoniczny:</span> {company.canonical_url}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
