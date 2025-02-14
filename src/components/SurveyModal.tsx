import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from './ui/Modal';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserCog } from 'lucide-react';
import debounce from 'lodash.debounce';
import { toast } from 'react-hot-toast';

interface SurveyField {
  id: string;
  module_id: string;
  name: string;
  label: string;
  field_type: 'text' | 'number' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'textarea' | 'rating' | 'email' | 'url' | 'nps' | 'year';
  options?: string[] | null;
  is_required: boolean;
  order_index: number;
}

interface SurveyModule {
  id: string;
  name: string;
  description: string;
  fields: SurveyField[];
  order_index?: number;
}

interface SurveyForm {
  id: string;
  name: string;
  description?: string;
  modules: SurveyModule[];
}

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyForm?: SurveyForm | null;
  assignmentId: string;
}

export const SurveyModal: React.FC<SurveyModalProps> = ({
  isOpen,
  onClose,
  surveyForm,
  assignmentId
}) => {
  const { user, isAdmin, isEditor } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [surveyData, setSurveyData] = useState<SurveyForm | null>(null);
  const [existingResponse, setExistingResponse] = useState<{ created_at: string } | null>(null);
  const [systemId, setSystemId] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const canSubmitSurvey = user && (isAdmin || (!isAdmin && !isEditor));

  if (!canSubmitSurvey) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <div className="p-8 text-center">
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <UserCog className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-700 text-lg">
              Zaloguj się lub zarejestruj, aby dokonać oceny.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login', { state: { from: location.pathname } })}
              className="w-full flex items-center justify-center gap-3 px-6 py-2.5 bg-[#2c3b67] text-white rounded-lg hover:bg-[#2c3b67]/90 transition-colors font-medium text-base"
            >
              <LogIn className="w-5 h-5" />
              Logowanie
            </button>
            <button
              onClick={() => navigate('/register', { state: { from: location.pathname } })}
              className="w-full flex items-center justify-center gap-3 px-6 py-2.5 bg-[#F5F5F7] text-[#1d1d1f] rounded-lg hover:bg-[#E8E8ED] transition-colors font-medium text-base"
            >
              <UserCog className="w-5 h-5" />
              Rejestracja
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Twoje dane są bezpieczne i nie będą udostępniane osobom trzecim.
          </p>
        </div>
      </Modal>
    );
  }

  const handleLogin = () => { // eslint-disable-line @typescript-eslint/no-unused-vars
    onClose();
    navigate('/admin/login', { state: { from: location.pathname } });
  };

  const handleRegister = () => { // eslint-disable-line @typescript-eslint/no-unused-vars
    onClose();
    navigate('/admin/register', { state: { from: location.pathname } });
  };

  useEffect(() => {
    const loadSurveyData = async () => {
      if (!surveyForm?.id) return;

      try {
        setLoading(true);

        // Load modules with order
        const { data: modulesData, error: modulesError } = await supabase
          .from('survey_modules')
          .select('*')
          .eq('form_id', surveyForm.id)
          .order('order_index', { ascending: true });

        if (modulesError) {
          console.error('Error loading modules:', modulesError);
          setError('Błąd podczas ładowania modułów');
          return;
        }

        // Load fields for each module with order
        const modulePromises = modulesData.map(async (module) => {
          const { data: fieldsData, error: fieldsError } = await supabase
            .from('survey_fields')
            .select(`
              id,
              module_id,
              name,
              label,
              field_type,
              options,
              is_required,
              order_index
            `)
            .eq('module_id', module.id)
            .order('order_index', { ascending: true });

          if (fieldsError) {
            console.error('Error loading fields:', fieldsError);
            return { ...module, fields: [] };
          }

          // Map fields to include label
          const fieldsWithLabel = fieldsData?.map(field => ({
            ...field,
            label: field.label || field.name // Use name as label if not specified
          })) || [];

          return { ...module, fields: fieldsWithLabel };
        });

        const modulesWithFields = await Promise.all(modulePromises);

        setSurveyData({
          ...surveyForm,
          modules: modulesWithFields
        });

      } catch (error) {
        console.error('Error loading survey data:', error);
        setError('Błąd podczas ładowania ankiety');
      } finally {
        setLoading(false);
      }
    };

    loadSurveyData();
  }, [surveyForm?.id]);

  useEffect(() => {
    const checkExistingResponse = async () => {
      if (!user || !assignmentId) return;

      const { data, error } = await supabase
        .from('survey_responses')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking existing response:', error);
        return;
      }

      if (data) {
        setExistingResponse(data);
      }
    };

    checkExistingResponse();
  }, [user, assignmentId]);

  useEffect(() => {
    const fetchSystemIdAndDraft = async () => {
      if (!assignmentId || !user) return;

      const { data: assignmentData, error: assignmentError } = await supabase
        .from('survey_assignments')
        .select(`
          target_id,
          target_type
        `)
        .eq('id', assignmentId)
        .single();

      if (assignmentError) {
        console.error('Error fetching system ID:', assignmentError);
        return;
      }

      if (assignmentData && assignmentData.target_type === 'system') {
        console.log('Found system ID:', assignmentData.target_id);
        setSystemId(assignmentData.target_id);

        // Fetch existing draft
        const { data: draftData, error: draftError } = await supabase
          .from('survey_drafts')
          .select('form_data')
          .eq('user_id', user.id)
          .eq('system_id', assignmentData.target_id)
          .maybeSingle();

        if (draftError) {
          console.error('Error fetching draft:', draftError);
          return;
        }

        if (draftData) {
          console.log('Found existing draft:', draftData);
          setFormData(draftData.form_data);
        }
      }
    };

    fetchSystemIdAndDraft();
  }, [assignmentId, user]);

  const debouncedSaveDraft = useCallback(
    debounce(async (data: Record<string, any>, userId: string, sysId: string) => {
      if (!userId || !sysId) return;

      // First check if user has submitted in past 12 months
      const { data: existingResponse } = await supabase
        .from('survey_responses')
        .select('created_at')
        .eq('user_id', userId)
        .eq('system_id', sysId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingResponse) {
        const lastSubmissionDate = new Date(existingResponse.created_at);
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        if (lastSubmissionDate > twelveMonthsAgo) {
          // User has submitted within last 12 months, don't save draft
          console.log('Not saving draft - user has submitted within last 12 months');
          setSavingDraft(false);
          return;
        }
      }

      try {
        setSavingDraft(true);
        const { error } = await supabase
          .from('survey_drafts')
          .upsert({
            user_id: userId,
            system_id: sysId,
            form_data: data
          }, {
            onConflict: 'user_id,system_id'
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error saving draft:', error);
      } finally {
        setSavingDraft(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    if (user && systemId && Object.keys(formData).length > 0) {
      console.log('Saving draft for system:', systemId);
      debouncedSaveDraft(formData, user.id, systemId);
    }
  }, [formData, user, systemId]);

  const handleFieldChange = (moduleId: string, fieldId: string, value: any) => {
    console.log('Field changed:', { moduleId, fieldId, value });
    const newFormData = {
      ...formData,
      [moduleId]: {
        ...(formData[moduleId] || {}),
        [fieldId]: value
      }
    };
    console.log('New form data:', newFormData);
    setFormData(newFormData);
  };

  const clearDraft = async () => { // eslint-disable-line @typescript-eslint/no-unused-vars
    if (!user || !systemId) return;

    console.log('Clearing draft from database...');
    const { error } = await supabase
      .from('survey_drafts')
      .delete()
      .eq('user_id', user.id)
      .eq('system_id', systemId);

    if (error) {
      console.error('Error clearing draft:', error);
    } else {
      console.log('Draft cleared successfully');
    }
  };

  const canSubmitNewSurvey = () => {
    if (!existingResponse) return true;

    const lastSubmissionDate = new Date(existingResponse.created_at);
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    return lastSubmissionDate < twelveMonthsAgo;
  };

  const handleSubmit = async () => {
    try {
      if (!surveyForm) {
        setError('Nie można znaleźć formularza ankiety.');
        return;
      }

      if (!canSubmitNewSurvey()) {
        const lastSubmissionDate = new Date(existingResponse!.created_at);
        const nextAvailableDate = new Date(lastSubmissionDate);
        nextAvailableDate.setMonth(nextAvailableDate.getMonth() + 12);

        setError(`Możesz wypełnić ankietę dla tego systemu tylko raz na 12 miesięcy. Następna możliwość wypełnienia ankiety będzie dostępna od ${nextAvailableDate.toLocaleDateString('pl-PL')}.`);
        return;
      }

      let hasErrors = false;
      const missingFields: string[] = [];

      surveyForm.modules.forEach(module => {
        module.fields.forEach(field => {
          if (field.is_required) {
            const moduleData = formData[module.id] || {};
            if (!moduleData[field.id]) {
              hasErrors = true;
              missingFields.push(`${module.name} - ${field.label}`);
            }
          }
        });
      });

      if (hasErrors) {
        setError(`Proszę wypełnić wszystkie wymagane pola: ${missingFields.join(', ')}`);
        return;
      }

      setLoading(true);
      setError(null);

      console.log('Submitting survey response...');
      const { error: submitError } = await supabase
        .from('survey_responses')
        .insert({
          form_id: surveyForm.id,
          assignment_id: assignmentId,
          user_id: user!.id,
          responses: formData
        });

      if (submitError) throw submitError;

      if (user && systemId) {
        console.log('Deleting draft after successful submission...');
        const { error: deleteError } = await supabase
          .from('survey_drafts')
          .delete()
          .eq('user_id', user.id)
          .eq('system_id', systemId);

        if (deleteError) {
          console.error('Error deleting draft:', deleteError);
        } else {
          console.log('Draft deleted successfully');
        }
      }

      toast.success('Dziękujemy za wypełnienie ankiety.');
      onClose();
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error('Wystąpił błąd podczas zapisywania ankiety. Spróbuj ponownie później.');
      setError('Wystąpił błąd podczas zapisywania ankiety. Spróbuj ponownie później.');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || savingDraft;
  const submitButtonText = loading ? 'Zapisywanie...' : savingDraft ? 'Zapisywanie wersji roboczej...' : 'Zapisz';

  const renderField = (module: SurveyModule, field: SurveyField) => {
    const value = formData[module.id]?.[field.id] ?? '';

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <input
            type={field.field_type}
            value={value}
            onChange={(e) => handleFieldChange(module.id, field.id, e.target.value)}
            className={`sf-input w-full ${field.is_required ? 'required' : ''}`}
            required={field.is_required}
            aria-required={field.is_required}
            aria-label={field.name}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(module.id, field.id, e.target.value)}
            className={`sf-input w-full ${field.is_required ? 'required' : ''}`}
            required={field.is_required}
            aria-required={field.is_required}
            aria-label={field.name}
          />
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(module.id, field.id, e.target.value)}
            className={`sf-input w-full min-h-[100px] ${field.is_required ? 'required' : ''}`}
            required={field.is_required}
            aria-required={field.is_required}
            aria-label={field.name}
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(module.id, field.id, e.target.value)}
            className={`sf-input w-full ${field.is_required ? 'required' : ''}`}
            required={field.is_required}
            aria-required={field.is_required}
            aria-label={field.name}
          >
            <option value="">Wybierz...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <select
            multiple
            value={selectedValues}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions).map(opt => opt.value);
              handleFieldChange(module.id, field.id, values);
            }}
            className={`sf-input w-full ${field.is_required ? 'required' : ''}`}
            required={field.is_required}
            aria-required={field.is_required}
            aria-label={field.name}
          >
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`${module.id}-${field.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(module.id, field.id, e.target.value)}
                  className={`sf-radio ${field.is_required ? 'required' : ''}`}
                  required={field.is_required}
                  aria-required={field.is_required}
                  aria-label={`${field.name} - ${option}`}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        const checkedValues = Array.isArray(value) ? value : [];
        const options = field.options || [];
        const midPoint = Math.ceil(options.length / 2);
        const leftColumn = options.slice(0, midPoint);
        const rightColumn = options.slice(midPoint);

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              {leftColumn.map((option) => (
                <label key={option} className="flex items-start gap-2 py-1">
                  <input
                    type="checkbox"
                    value={option}
                    checked={checkedValues.includes(option)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...checkedValues, option]
                        : checkedValues.filter(v => v !== option);
                      handleFieldChange(module.id, field.id, newValues);
                    }}
                    className={`sf-checkbox flex-shrink-0 mt-1 w-4 h-4 ${field.is_required ? 'required' : ''}`}
                    required={field.is_required && checkedValues.length === 0}
                    aria-required={field.is_required}
                    aria-label={`${field.name} - ${option}`}
                  />
                  <span className="text-[15px] leading-relaxed">{option}</span>
                </label>
              ))}
            </div>
            <div className="sm:block">
              {rightColumn.map((option) => (
                <label key={option} className="flex items-start gap-2 py-1">
                  <input
                    type="checkbox"
                    value={option}
                    checked={checkedValues.includes(option)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...checkedValues, option]
                        : checkedValues.filter(v => v !== option);
                      handleFieldChange(module.id, field.id, newValues);
                    }}
                    className={`sf-checkbox flex-shrink-0 mt-1 w-4 h-4 ${field.is_required ? 'required' : ''}`}
                    required={field.is_required && checkedValues.length === 0}
                    aria-required={field.is_required}
                    aria-label={`${field.name} - ${option}`}
                  />
                  <span className="text-[15px] leading-relaxed">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 'rating':
        const ratingLabels = {
          1: 'Słaby',
          2: 'Poniżej średniej',
          3: 'Przeciętny',
          4: 'Znakomity',
          5: 'Wyjątkowy'
        };

        return (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleFieldChange(module.id, field.id, rating)}
                  className={`sf-rating-button p-1.5 hover:scale-110 transition-transform relative group ${value === rating ? 'active' : ''} ${field.is_required ? 'required' : ''}`}
                  aria-required={field.is_required}
                  aria-label={`${field.name} - ${rating} gwiazdek - ${ratingLabels[rating as keyof typeof ratingLabels]}`}
                >
                  <span className={`w-12 h-12 inline-flex items-center justify-center text-3xl ${value >= rating ? 'text-[#2c3b67]' : 'text-gray-200'}`}>
                    ★
                  </span>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {ratingLabels[rating as keyof typeof ratingLabels]}
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handleFieldChange(module.id, field.id, 'n/a')}
              className={`sf-rating-button h-12 px-4 rounded-lg text-base flex items-center justify-center relative group ${
                value === 'n/a' 
                  ? 'bg-[#2c3b67] text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors`}
              aria-label={`${field.name} - nie dotyczy`}
            >
              N/A
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Nie dotyczy
              </div>
            </button>
          </div>
        );
      case 'nps':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleFieldChange(module.id, field.id, rating)}
                  className={`w-12 h-12 rounded-lg text-lg font-medium flex items-center justify-center transition-all relative group
                    ${value === rating 
                      ? 'bg-[#2c3b67] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                    ${field.is_required ? 'required' : ''}`}
                  aria-required={field.is_required}
                  aria-label={`${field.name} - ${rating}`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Mało prawdopodobne</span>
              <span>Bardzo prawdopodobne</span>
            </div>
          </div>
        );
      case 'year':
        const currentYear = new Date().getFullYear();
        const startYear = 1990;
        const years = Array.from(
          { length: currentYear - startYear + 1 },
          (_, i) => currentYear - i
        );

        return (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(module.id, field.id, e.target.value)}
            className={`sf-input w-full ${field.is_required ? 'required' : ''}`}
            required={field.is_required}
            aria-required={field.is_required}
            aria-label={field.name}
          >
            <option value="">Wybierz rok...</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="xl"
      className="w-full"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-6">{surveyData?.name}</h2>
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg whitespace-pre-line">
              {error}
            </div>
          )}
          <div className="space-y-8">
            {surveyData?.modules.map((module) => (
              <div key={module.id} className="space-y-4 p-6 bg-gray-50 rounded-xl">
                <h3 className="text-xl font-medium text-[#2c3b67]">{module.name}</h3>
                {module.description && (
                  <p className="text-gray-600 mb-4">{module.description}</p>
                )}
                <div className="space-y-6">
                  {module.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label className="block font-medium">
                        {field.name}
                        {field.is_required && (
                          <span className="text-red-500 ml-1" title="Pole wymagane">*</span>
                        )}
                      </label>
                      {renderField(module, field)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-3 px-6 py-2.5 bg-[#F5F5F7] text-[#1d1d1f] rounded-lg hover:bg-[#E8E8ED] transition-colors font-medium text-base min-w-[120px]"
          >
            Anuluj
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="flex items-center justify-center gap-3 px-6 py-2.5 bg-[#2c3b67] text-white rounded-lg hover:bg-[#2c3b67]/90 transition-colors font-medium text-base min-w-[120px]"
          >
            {submitButtonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
