import React, { useState } from 'react';
import { Building2, UserCircle, Briefcase, Phone } from 'lucide-react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';
import { INDUSTRY_OPTIONS } from '../constants/industry';
import { COMPANY_SIZE_OPTIONS } from '../constants/company';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';
import { validateNIP, validatePolishPhone } from '../utils/validators';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    company_name: '',
    full_name: '',
    nip: '',
    phone_number: '',
    industry: '',
    position: '',
    company_size: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user profile data
  React.useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            company_name: data.company_name || '',
            full_name: data.full_name || '',
            nip: data.nip || '',
            phone_number: data.phone_number || '',
            industry: data.industry || '',
            position: data.position || '',
            company_size: data.company_size || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Nie udało się załadować profilu');
      }
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Clean data before sending
      const cleanNIP = formData.nip.replace(/[^0-9]/g, '');
      const cleanPhone = formData.phone_number.replace(/[^0-9]/g, '');

      // Validate NIP
      if (cleanNIP && !validateNIP(cleanNIP)) {
        setErrors(prev => ({ ...prev, nip: 'Nieprawidłowy numer NIP' }));
        return;
      }

      // Validate phone number
      if (cleanPhone && !validatePolishPhone(cleanPhone)) {
        setErrors(prev => ({ ...prev, phone_number: 'Nieprawidłowy numer telefonu' }));
        return;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          company_name: formData.company_name.trim() || null,
          full_name: formData.full_name.trim() || null,
          nip: cleanNIP || null,
          phone_number: cleanPhone || null,
          industry: formData.industry.trim() || null,
          position: formData.position.trim() || null,
          company_size: formData.company_size.trim() || null,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success('Profil został zaktualizowany');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Nie udało się zaktualizować profilu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove any non-digit characters
    const digits = value.replace(/[^0-9]/g, '');
    
    // Limit to exactly 9 digits
    return digits.slice(0, 9);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'phone_number') {
      formattedValue = formatPhoneNumber(value);
      const cleanPhone = formattedValue;
      
      if (cleanPhone.length === 9) {
        if (!validatePolishPhone(cleanPhone)) {
          setErrors(prev => ({ ...prev, phone_number: 'Nieprawidłowy numer telefonu. Numer musi mieć 9 cyfr i zaczynać się od cyfry 4-9' }));
        } else {
          setErrors(prev => ({ ...prev, phone_number: '' }));
        }
      } else {
        setErrors(prev => ({ ...prev, phone_number: '' }));
      }
    } else if (name === 'nip') {
      const cleanNIP = value.replace(/[^0-9]/g, '');
      if (cleanNIP.length === 10) {
        if (!validateNIP(cleanNIP)) {
          setErrors(prev => ({ ...prev, nip: 'Nieprawidłowy numer NIP' }));
        } else {
          setErrors(prev => ({ ...prev, nip: '' }));
        }
      } else {
        setErrors(prev => ({ ...prev, nip: '' }));
      }
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[24px] font-semibold text-[#1d1d1f]">
              Mój profil
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-[#0066CC]" />
                <h3 className="text-[21px] font-semibold text-[#1d1d1f]">
                  Informacje o firmie
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company_name" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Nazwa firmy
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <input
                      id="company_name"
                      name="company_name"
                      type="text"
                      value={formData.company_name}
                      onChange={handleChange}
                      className="sf-input pl-10 w-full"
                      placeholder="np. Firma Sp. z o.o."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="nip" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    NIP firmy
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <input
                      id="nip"
                      name="nip"
                      type="text"
                      value={formData.nip}
                      onChange={handleChange}
                      className={`sf-input pl-10 w-full ${
                        errors.nip ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      placeholder="000-000-00-00"
                    />
                    {errors.nip && (
                      <p className="mt-2 text-sm text-red-600">{errors.nip}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="company_size" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Wielkość firmy
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <select
                      id="company_size"
                      name="company_size"
                      value={formData.company_size}
                      onChange={handleChange}
                      className="sf-input pl-10 pr-10 w-full appearance-none bg-white cursor-pointer hover:bg-[#F5F5F7] transition-colors duration-200"
                    >
                      <option value="">Wybierz przedział</option>
                      {COMPANY_SIZE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="industry" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Branża
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="sf-input pl-10 pr-10 w-full appearance-none bg-white cursor-pointer hover:bg-[#F5F5F7] transition-colors duration-200"
                    >
                      <option value="">Wybierz branżę</option>
                      {INDUSTRY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <UserCircle className="w-6 h-6 text-[#0066CC]" />
                <h3 className="text-[21px] font-semibold text-[#1d1d1f]">
                  Dane kontaktowe
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="full_name" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Imię i nazwisko
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="sf-input pl-10 w-full"
                      placeholder="np. Jan Kowalski"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="position" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Stanowisko
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <input
                      id="position"
                      name="position"
                      type="text"
                      value={formData.position}
                      onChange={handleChange}
                      className="sf-input pl-10 w-full"
                      placeholder="np. Dyrektor IT"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Numer telefonu
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-3 text-[#1d1d1f] bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                      +48
                    </span>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                      <input
                        id="phone_number"
                        name="phone_number"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className={`sf-input pl-10 w-full rounded-l-none ${
                          errors.phone_number ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        placeholder="XXX XXX XXX"
                        maxLength={9}
                      />
                    </div>
                  </div>
                  {errors.phone_number && (
                    <p className="mt-2 text-sm text-red-600">{errors.phone_number}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="sf-button-secondary"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="sf-button-primary"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Zapisywanie...
                  </div>
                ) : (
                  'Zapisz zmiany'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
