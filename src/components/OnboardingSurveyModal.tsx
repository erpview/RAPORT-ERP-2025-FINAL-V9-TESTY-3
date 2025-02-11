import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface OnboardingSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingSurveyModal: React.FC<OnboardingSurveyModalProps> = ({ isOpen, onClose }) => {
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
      // Update only the survey fields in the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          czy_korzysta_z_erp: formData.czy_korzysta_z_erp,
          czy_zamierza_wdrozyc_erp: formData.czy_zamierza_wdrozyc_erp,
          czy_dokonal_wyboru_erp: formData.czy_dokonal_wyboru_erp
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      toast.success('Dziękujemy za wypełnienie ankiety');
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Wystąpił błąd podczas zapisywania odpowiedzi');
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
      title="Witamy w Raporcie ERP"
      maxWidth="max-w-lg"
      persistent={true}
    >
      <div className="space-y-4">
        <p className="text-[17px] text-[#86868b]">
          Aby lepiej dostosować naszą platformę do Twoich potrzeb, prosimy o odpowiedź na kilka krótkich pytań.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-[15px] font-medium text-[#1d1d1f]">
              Czy korzystasz z systemu ERP?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleChange('czy_korzysta_z_erp', true)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                  formData.czy_korzysta_z_erp === true
                    ? 'bg-[#2c3b67] text-white'
                    : 'bg-white text-[#1d1d1f] border border-[#d2d2d7] hover:bg-[#F5F5F7]'
                }`}
              >
                Tak
              </button>
              <button
                type="button"
                onClick={() => handleChange('czy_korzysta_z_erp', false)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                  formData.czy_korzysta_z_erp === false
                    ? 'bg-[#2c3b67] text-white'
                    : 'bg-white text-[#1d1d1f] border border-[#d2d2d7] hover:bg-[#F5F5F7]'
                }`}
              >
                Nie
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[15px] font-medium text-[#1d1d1f]">
              Czy zamierzasz wdrożyć system ERP?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleChange('czy_zamierza_wdrozyc_erp', true)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                  formData.czy_zamierza_wdrozyc_erp === true
                    ? 'bg-[#2c3b67] text-white'
                    : 'bg-white text-[#1d1d1f] border border-[#d2d2d7] hover:bg-[#F5F5F7]'
                }`}
              >
                Tak
              </button>
              <button
                type="button"
                onClick={() => handleChange('czy_zamierza_wdrozyc_erp', false)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                  formData.czy_zamierza_wdrozyc_erp === false
                    ? 'bg-[#2c3b67] text-white'
                    : 'bg-white text-[#1d1d1f] border border-[#d2d2d7] hover:bg-[#F5F5F7]'
                }`}
              >
                Nie
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[15px] font-medium text-[#1d1d1f]">
              Czy dokonałeś już wyboru systemu ERP?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleChange('czy_dokonal_wyboru_erp', true)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                  formData.czy_dokonal_wyboru_erp === true
                    ? 'bg-[#2c3b67] text-white'
                    : 'bg-white text-[#1d1d1f] border border-[#d2d2d7] hover:bg-[#F5F5F7]'
                }`}
              >
                Tak
              </button>
              <button
                type="button"
                onClick={() => handleChange('czy_dokonal_wyboru_erp', false)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                  formData.czy_dokonal_wyboru_erp === false
                    ? 'bg-[#2c3b67] text-white'
                    : 'bg-white text-[#1d1d1f] border border-[#d2d2d7] hover:bg-[#F5F5F7]'
                }`}
              >
                Nie
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center px-6 py-2.5 bg-[#2c3b67] text-white text-[15px] font-medium rounded-lg hover:bg-[#2c3b67]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Zapisywanie...
              </>
            ) : (
              'Zapisz i kontynuuj'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default OnboardingSurveyModal;
