import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SurveyModal: React.FC<SurveyModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    czy_korzysta_z_erp: null as boolean | null,
    czy_zamierza_wdrozyc_erp: null as boolean | null,
    czy_dokonal_wyboru_erp: null as boolean | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Błąd: Brak identyfikatora użytkownika');
      return;
    }

    // Validate that all questions are answered
    if (Object.values(formData).some(value => value === null)) {
      toast.error('Proszę odpowiedzieć na wszystkie pytania');
      return;
    }

    setIsSubmitting(true);
    try {
      // Try to upsert the profile (update or insert if not exists)
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          czy_korzysta_z_erp: formData.czy_korzysta_z_erp,
          czy_zamierza_wdrozyc_erp: formData.czy_zamierza_wdrozyc_erp,
          czy_dokonal_wyboru_erp: formData.czy_dokonal_wyboru_erp
        }, {
          onConflict: 'id'
        });

      if (upsertError) {
        console.error('Supabase upsert error:', {
          error: upsertError,
          code: upsertError.code,
          details: upsertError.details,
          hint: upsertError.hint,
          message: upsertError.message
        });
        throw upsertError;
      }

      toast.success('Dziękujemy za wypełnienie ankiety');
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      let errorMessage = 'Wystąpił błąd podczas zapisywania odpowiedzi';
      if (error.message) {
        if (error.message.includes('permission denied')) {
          errorMessage = 'Brak uprawnień do zapisania odpowiedzi';
        } else if (error.message.includes('foreign key constraint')) {
          errorMessage = 'Błąd powiązania z profilem użytkownika';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ankieta dotycząca systemów ERP"
      maxWidth="max-w-lg"
      persistent={true}
    >
      <div className="space-y-4 mb-6">
        <p className="text-gray-600">
          Prosimy o wypełnienie krótkiej ankiety. Twoje odpowiedzi pomogą nam lepiej zrozumieć potrzeby naszych użytkowników.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="font-medium">Czy korzystasz z systemu ERP?</p>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleChange('czy_korzysta_z_erp', true)}
                className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
                  formData.czy_korzysta_z_erp === true
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
              >
                Tak
              </button>
              <button
                type="button"
                onClick={() => handleChange('czy_korzysta_z_erp', false)}
                className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
                  formData.czy_korzysta_z_erp === false
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
              >
                Nie
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Czy zamierzasz wdrożyć system ERP?</p>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleChange('czy_zamierza_wdrozyc_erp', true)}
                className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
                  formData.czy_zamierza_wdrozyc_erp === true
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
              >
                Tak
              </button>
              <button
                type="button"
                onClick={() => handleChange('czy_zamierza_wdrozyc_erp', false)}
                className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
                  formData.czy_zamierza_wdrozyc_erp === false
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
              >
                Nie
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Czy dokonałeś już wyboru systemu ERP?</p>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleChange('czy_dokonal_wyboru_erp', true)}
                className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
                  formData.czy_dokonal_wyboru_erp === true
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
              >
                Tak
              </button>
              <button
                type="button"
                onClick={() => handleChange('czy_dokonal_wyboru_erp', false)}
                className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
                  formData.czy_dokonal_wyboru_erp === false
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
              >
                Nie
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="sf-button-primary w-full justify-center"
          >
            {isSubmitting ? (
              <>
                <svg className="w-5 h-5 animate-spin mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Zapisywanie...
              </>
            ) : (
              'Zapisz odpowiedzi'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
