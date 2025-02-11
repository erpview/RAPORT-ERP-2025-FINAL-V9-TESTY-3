import React, { useEffect, useState } from 'react';
import { adminSupabase as supabase } from '../config/supabase';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { Layers } from 'lucide-react';

interface SurveyResponse {
  id: string;
  created_at: string;
  responses: Record<string, any>;
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
    email: string;
  };
  formattedResponses: any;
}

const AdminSurveyResponses = () => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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
        const { data: systemsData } = await supabase
          .from('systems')
          .select('*')
          .in('id', targetIds);

        // Step 4: Get user profiles
        const userIds = responsesData?.map(r => r.user_id) || [];
        const { data: usersData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);

        // Step 5: Get forms
        const formIds = responsesData?.map(r => r.form_id) || [];
        const { data: formsData } = await supabase
          .from('survey_forms')
          .select('*')
          .in('id', formIds);

        // Step 6: Get fields and modules for response formatting
        const { data: fieldsData } = await supabase
          .from('survey_fields')
          .select('*');

        const { data: modulesData } = await supabase
          .from('survey_modules')
          .select('*');

        // Create lookup maps
        const assignmentMap = (assignmentsData || []).reduce((acc: any, assignment) => {
          acc[assignment.id] = assignment;
          return acc;
        }, {});

        const systemMap = (systemsData || []).reduce((acc: any, system) => {
          acc[system.id] = system;
          return acc;
        }, {});

        const userMap = (usersData || []).reduce((acc: any, user) => {
          acc[user.id] = user;
          return acc;
        }, {});

        const formMap = (formsData || []).reduce((acc: any, form) => {
          acc[form.id] = form;
          return acc;
        }, {});

        const fieldMap = (fieldsData || []).reduce((acc: any, field) => {
          acc[field.id] = field;
          return acc;
        }, {});

        const moduleMap = (modulesData || []).reduce((acc: any, module) => {
          acc[module.id] = module;
          return acc;
        }, {});

        // Combine all data
        const enhancedResponses = (responsesData || []).map(response => {
          const assignment = assignmentMap[response.assignment_id];
          const system = assignment?.target_type === 'system' ? systemMap[assignment.target_id] : null;
          const user = userMap[response.user_id];
          const form = formMap[response.form_id];

          // Format responses
          const formattedResponses = Object.entries(response.responses || {}).map(([moduleId, fields]: [string, any]) => {
            const moduleName = moduleMap[moduleId]?.name || 'Nieznany moduł';
            const formattedFields = Object.entries(fields).map(([fieldId, value]) => {
              const field = fieldMap[fieldId];
              let formattedValue = value;

              // Format value based on field type
              if (field?.field_type === 'checkbox' && Array.isArray(value)) {
                formattedValue = value.join(', ');
              } else if (field?.field_type === 'select' || field?.field_type === 'radio') {
                formattedValue = value?.toString() || '';
              } else if (value === null || value === undefined) {
                formattedValue = '-';
              } else if (Array.isArray(value)) {
                formattedValue = value.join(', ');
              }

              return {
                fieldName: field?.name || 'Nieznane pole',
                value: formattedValue,
                fieldType: field?.field_type
              };
            });
            return { moduleName, fields: formattedFields };
          });

          return {
            ...response,
            form,
            assignment: {
              ...assignment,
              system
            },
            user,
            formattedResponses
          };
        });

        console.log('Enhanced responses:', enhancedResponses);
        setResponses(enhancedResponses);
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
              <div key={response.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[19px] font-semibold text-[#1d1d1f]">
                        {response.form?.name || 'Nieznana ankieta'}
                      </h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-[15px] text-[#86868b]">
                          System: {response.assignment?.system?.name} {response.assignment?.system?.vendor ? `(${response.assignment?.system?.vendor})` : ''}
                        </p>
                        <p className="text-[15px] text-[#86868b]">
                          Użytkownik: {getUserName(response.user)}
                        </p>
                        <p className="text-[15px] text-[#86868b]">
                          Wypełniono: {format(new Date(response.created_at), 'PPp', { locale: pl })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-6">
                    {response.formattedResponses?.map((moduleResponse: any, moduleIndex: number) => (
                      <div key={moduleIndex}>
                        <h4 className="text-[17px] font-medium text-[#1d1d1f] mb-3">
                          {moduleResponse.moduleName}
                        </h4>
                        <div className="space-y-3 bg-[#F5F5F7] rounded-xl p-4">
                          {moduleResponse.fields.map((field: any, fieldIndex: number) => (
                            <div key={fieldIndex} className="flex">
                              <span className="text-[15px] font-medium text-[#1d1d1f] w-1/3">
                                {field.fieldName}:
                              </span>
                              <span className="text-[15px] text-[#1d1d1f] w-2/3">
                                {field.fieldType === 'checkbox' ? (
                                  <div className="flex flex-wrap gap-2">
                                    {field.value.split(', ').map((item: string, i: number) => (
                                      <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {item}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  field.value
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSurveyResponses;
