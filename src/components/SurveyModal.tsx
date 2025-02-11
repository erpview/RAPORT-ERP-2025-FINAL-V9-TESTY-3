import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserCog } from 'lucide-react';

interface SurveyField {
  id: string;
  name: string;
  label: string;
  field_type: 'text' | 'number' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'textarea' | 'rating' | 'email' | 'url';
  options?: string[];
  is_required: boolean;
  order_index?: number;
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

  const handleLogin = () => {
    onClose();
    navigate('/admin/login', { state: { from: location.pathname } });
  };

  const handleRegister = () => {
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
            .select('*')
            .eq('module_id', module.id)
            .order('order_index', { ascending: true });

          if (fieldsError) {
            console.error('Error loading fields:', fieldsError);
            return { ...module, fields: [] };
          }

          return { ...module, fields: fieldsData || [] };
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

  const handleFieldChange = (moduleId: string, fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [fieldId]: value
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      const hasErrors = false;
      const missingFields: string[] = [];

      surveyData?.modules.forEach((module) => {
        module.fields.forEach((field) => {
          if (field.is_required && (!formData[module.id] || !formData[module.id][field.id])) {
            hasErrors = true;
            missingFields.push(`${module.name} - ${field.name}`);
          }
        });
      });

      if (hasErrors) {
        setError(`Proszę wypełnić wszystkie wymagane pola:\n${missingFields.join('\n')}`);
        return;
      }

      if (!user) {
        setError('Musisz być zalogowany, aby wypełnić ankietę');
        return;
      }

      if (!assignmentId || !surveyData?.id) {
        setError('Nie znaleziono przypisania ankiety');
        return;
      }

      setLoading(true);
      setError(null);

      // First, insert the survey response
      const { error: responseError } = await supabase
        .from('survey_responses')
        .insert({
          form_id: surveyData.id,
          assignment_id: assignmentId,
          user_id: user.id,
          responses: formData
        });

      if (responseError) {
        throw responseError;
      }

      // Then update the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          czy_korzysta_z_erp: true,
          czy_dokonal_wyboru_erp: true
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Don't throw here as the survey was already saved
      }

      setLoading(false);
      onClose();
    } catch (error) {
      console.error('Error submitting survey:', error);
      setError('Błąd podczas zapisywania ankiety');
      setLoading(false);
    }
  };

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
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center gap-2">
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
                  className={`sf-checkbox ${field.is_required ? 'required' : ''}`}
                  required={field.is_required && checkedValues.length === 0}
                  aria-required={field.is_required}
                  aria-label={`${field.name} - ${option}`}
                />
                <span>{option}</span>
              </label>
            ))}
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
            disabled={loading}
            className="flex items-center justify-center gap-3 px-6 py-2.5 bg-[#2c3b67] text-white rounded-lg hover:bg-[#2c3b67]/90 transition-colors font-medium text-base min-w-[120px]"
          >
            {loading ? 'Zapisywanie...' : 'Zapisz'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
