import React, { useEffect, useState } from 'react';
import { adminSupabase as supabase } from '../config/supabase';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { Layers } from 'lucide-react';

interface FormattedField {
  field_name: string;
  field_type: 'text' | 'number' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'textarea' | 'rating' | 'email' | 'url';
  value: string | number | string[] | null;
}

interface ModuleResponse {
  module_name: string;
  module_description?: string;
  fields: FormattedField[];
}

interface SurveyResponse {
  id: string;
  created_at: string;
  responses: Record<string, any>;
  form_id: string;
  user_id: string;
  assignment_id: string;
  form: {
    name: string;
  };
  assignment: {
    target_name: string;
    system: {
      name: string;
      vendor: string;
    };
  };
  user: {
    full_name: string;
    industry?: string;
    company_size?: string;
  };
  formattedResponses: ModuleResponse[];
}

interface UserProfile {
  id: string;
  full_name: string;
  industry?: string;
  company_size?: string;
}

interface SystemData {
  id: string;
  name: string;
  vendor: string;
}

interface SurveyField {
  id: string;
  name: string;
  field_type: 'text' | 'number' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'textarea' | 'rating' | 'email' | 'url';
  module_id: string;
  order_index: number;
}

interface SurveyModule {
  id: string;
  name: string;
  description?: string;
  form_id: string;
  order_index: number;
}

interface Assignment {
  id: string;
  target_type: string;
  target_id: string;
  target_name: string;
}

const AdminSurveyResponses = () => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedResponses, setExpandedResponses] = useState<string[]>([]);
  const { user } = useAuth();

  const toggleResponse = (responseId: string) => {
    setExpandedResponses(prev => 
      prev.includes(responseId) 
        ? prev.filter(id => id !== responseId)
        : [...prev, responseId]
    );
  };

  // Find overall rating field if it exists
  const getOverallRating = (response: SurveyResponse) => {
    for (const moduleResponse of response.formattedResponses || []) {
      for (const field of moduleResponse.fields || []) {
        if (field.field_name === 'Oceń swoje ogólne wrażenia z tym systemem' && field.field_type === 'rating') {
          return field.value;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        // Step 1: Get basic survey responses
        const { data: responsesData, error: responsesError } = await supabase
          .from('survey_responses')
          .select('*')
          .order('created_at', { ascending: false });

        if (responsesError) {
          console.error('Error fetching responses:', responsesError);
          throw responsesError;
        }

        // Step 2: Get assignments
        const assignmentIds = responsesData?.map(r => r.assignment_id) || [];
        const { data: assignmentsData } = await supabase
          .from('survey_assignments')
          .select('*')
          .in('id', assignmentIds);

        // Step 3: Get systems
        const targetIds = assignmentsData?.filter(a => a.target_type === 'system').map(a => a.target_id) || [];
        let systemsData: SystemData[] = [];
        
        if (targetIds.length > 0) {
          const { data, error: systemsError } = await supabase
            .from('systems')
            .select()
            .in('id', targetIds);

          if (systemsError) {
            console.error('Error fetching systems:', systemsError);
            throw systemsError;
          }
          systemsData = data || [];
        }

        // Step 4: Get user profiles
        const userIds = responsesData?.map(r => r.user_id).filter(Boolean) || [];
        let usersData: UserProfile[] = [];
        
        if (userIds.length > 0) {
          const { data, error: usersError } = await supabase
            .from('profiles')
            .select()
            .in('id', userIds);

          if (usersError) {
            console.error('Error fetching user profiles:', usersError);
            throw usersError;
          }
          usersData = data || [];
        }

        // Step 5: Get forms
        const formIds = responsesData?.map(r => r.form_id) || [];
        let formsData: { id: string; name: string; }[] = [];

        if (formIds.length > 0) {
          const { data: forms, error: formsError } = await supabase
            .from('survey_forms')
            .select()
            .in('id', formIds);

          if (formsError) {
            console.error('Error fetching forms:', formsError);
            throw formsError;
          }
          formsData = forms || [];
        }

        // Step 6: Get fields and modules for response formatting
        const { data: fieldsData = [], error: fieldsError } = await supabase
          .from('survey_fields')
          .select()
          .order('order_index', { ascending: true });

        if (fieldsError) {
          console.error('Error fetching fields:', fieldsError);
          throw fieldsError;
        }

        const { data: modulesData = [], error: modulesError } = await supabase
          .from('survey_modules')
          .select()
          .order('order_index', { ascending: true });

        if (modulesError) {
          console.error('Error fetching modules:', modulesError);
          throw modulesError;
        }

        // Create lookup maps
        const userMap = (usersData || []).reduce<Record<string, UserProfile>>((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});

        const systemMap = (systemsData || []).reduce<Record<string, SystemData>>((acc, system) => {
          acc[system.id] = system;
          return acc;
        }, {});

        const formMap = (formsData || []).reduce<Record<string, { id: string; name: string }>>((acc, form) => {
          acc[form.id] = form;
          return acc;
        }, {});

        // Create a map of modules by form_id
        const modulesByForm = (modulesData || []).reduce<Record<string, SurveyModule[]>>((acc, module) => {
          if (!acc[module.form_id]) {
            acc[module.form_id] = [];
          }
          acc[module.form_id].push(module);
          return acc;
        }, {});

        // Create a map of fields by module_id
        const fieldsByModule = (fieldsData || []).reduce<Record<string, SurveyField[]>>((acc, field) => {
          if (!acc[field.module_id]) {
            acc[field.module_id] = [];
          }
          acc[field.module_id].push(field);
          return acc;
        }, {});

        // Format responses with proper structure and order
        const formattedResponses = responsesData?.map(response => {
          const assignment = assignmentsData?.find(a => a.id === response.assignment_id);
          const system = assignment?.target_type === 'system' ? systemMap[assignment.target_id] : null;
          const user = userMap[response.user_id];
          const form = formMap[response.form_id];
          const modules = modulesByForm[response.form_id] || [];

          // Format responses according to module and field order
          const formattedResponses = modules.map((module: SurveyModule) => {
            const fields = fieldsByModule[module.id] || [];
            return {
              module_name: module.name,
              module_description: module.description,
              fields: fields.map((field: SurveyField) => ({
                field_name: field.name,
                field_type: field.field_type,
                value: field.field_type === 'checkbox' ? response.responses[module.id]?.[field.id] || [] : response.responses[module.id]?.[field.id] || null
              }))
            };
          });

          return {
            id: response.id,
            created_at: response.created_at,
            responses: response.responses,
            form_id: response.form_id,
            user_id: response.user_id,
            assignment_id: response.assignment_id,
            form: {
              name: form?.name || 'Nieznany formularz'
            },
            assignment: {
              target_name: system?.name || 'Nieznany system',
              system: {
                name: system?.name || 'Nieznany system',
                vendor: system?.vendor || 'Nieznany dostawca'
              }
            },
            user: {
              full_name: user?.full_name || 'Nieznany użytkownik',
              industry: user?.industry,
              company_size: user?.company_size
            },
            formattedResponses
          };
        }) || [];

        console.log('Enhanced responses:', formattedResponses);
        setResponses(formattedResponses);
      } catch (err) {
        console.error('Error fetching survey responses:', err);
        setError('Wystąpił błąd podczas pobierania odpowiedzi');
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

  const getUserName = (user: any) => {
    if (!user) return 'Nieznany użytkownik';
    return user.full_name || user.email || 'Nieznany użytkownik';
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1d1d1f]">Odpowiedzi ankiet</h1>
            <p className="text-[15px] text-[#86868b] mt-1">
              {responses.length} {responses.length === 1 ? 'odpowiedź' : 
                responses.length > 1 && responses.length < 5 ? 'odpowiedzi' : 'odpowiedzi'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin">
              <Layers className="w-8 h-8 text-[#007AFF]" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-[#FF3B30]">{error}</p>
          </div>
        ) : responses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#86868b]">Brak odpowiedzi na ankiety</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {responses.map((response: any) => (
              <div key={response.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleResponse(response.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-[19px] font-semibold text-[#1d1d1f] mb-1">
                        {response.form.name}
                      </h3>
                      <p className="text-[15px] text-[#86868b]">
                        System: {response.assignment.system.name} ({response.assignment.system.vendor})
                      </p>
                      <p className="text-[15px] text-[#86868b]">
                        Użytkownik: {getUserName(response.user)}
                      </p>
                      {(response.user.industry || response.user.company_size) && (
                        <div className="text-[15px] text-[#86868b] space-y-1">
                          {response.user.industry && (
                            <p>Branża: {response.user.industry}</p>
                          )}
                          {response.user.company_size && (
                            <p>Wielkość firmy: {response.user.company_size}</p>
                          )}
                        </div>
                      )}
                      <p className="text-[15px] text-[#6e6e73] mb-2">
                        Wypełniono: {format(new Date(response.created_at), "d LLLL yyyy, HH:mm", { locale: pl })}
                      </p>
                      {getOverallRating(response) && (
                        <p className="text-[15px] text-[#6e6e73]">
                          Ogólna ocena systemu: {' '}
                          <span className="text-[#2c3b67]">
                            {getOverallRating(response) === 'N/A' ? 'N/A' : '★'.repeat(Number(getOverallRating(response)))}
                          </span>
                        </p>
                      )}
                    </div>
                    <button 
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={expandedResponses.includes(response.id) ? "Zwiń" : "Rozwiń"}
                    >
                      <svg 
                        className={`w-6 h-6 transform transition-transform ${expandedResponses.includes(response.id) ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {expandedResponses.includes(response.id) && (
                  <div className="border-t border-gray-100 p-4">
                    {response.formattedResponses?.map((moduleResponse: ModuleResponse, moduleIndex: number) => (
                      <div key={moduleIndex}>
                        <h4 className="text-[17px] font-medium text-[#1d1d1f] mb-3">
                          {moduleResponse.module_name}
                        </h4>
                        <div className="space-y-3 bg-[#F5F5F7] rounded-xl p-4 mb-4">
                          {moduleResponse.fields.map((field: FormattedField, fieldIndex: number) => (
                            <div key={fieldIndex} className="flex items-start">
                              <span className="text-[15px] font-medium text-[#1d1d1f] w-1/3">
                                {field.field_name}:
                              </span>
                              <span className="text-[15px] text-[#1d1d1f] w-2/3">
                                {field.field_type === 'checkbox' && Array.isArray(field.value) ? (
                                  <div className="flex flex-wrap gap-2">
                                    {field.value.map((item: string, i: number) => (
                                      <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {item}
                                      </span>
                                    ))}
                                  </div>
                                ) : field.field_type === 'rating' ? (
                                  <span className="text-[#2c3b67]">
                                    {field.value === 'N/A' ? 'N/A' : '★'.repeat(Number(field.value))}
                                  </span>
                                ) : Array.isArray(field.value) ? (
                                  field.value.join(', ')
                                ) : field.value === null || field.value === undefined ? (
                                  '-'
                                ) : (
                                  field.value.toString()
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSurveyResponses;
