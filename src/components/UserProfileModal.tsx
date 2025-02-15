import React, { useState, useEffect } from 'react';
import { Building2, UserCircle, Briefcase, Phone } from 'lucide-react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';
import { INDUSTRY_OPTIONS } from '../constants/industry';
import { COMPANY_SIZE_OPTIONS } from '../constants/company';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';
import { validateNIP, validatePolishPhone } from '../utils/validators';
import { useOnboarding } from '../context/OnboardingContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { checkOnboardingStatus } = useOnboarding();
  const [isLinkedInUser, setIsLinkedInUser] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    full_name: '',
    nip: '',
    phone_number: '',
    industry: '',
    position: '',
    company_size: '',
    czy_korzysta_z_erp: null,
    czy_zamierza_wdrozyc_erp: null,
    czy_dokonal_wyboru_erp: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user profile and check if LinkedIn user
  useEffect(() => {
    const loadProfileAndCheckUser = async () => {
      if (!user) return;
      
      try {
        // Check if LinkedIn user
        const { data: userData, error: userError } = await supabase
          .from('user_management')
          .select('auth_provider')
          .eq('user_id', user.id)
          .single();

        if (userError) throw userError;
        setIsLinkedInUser(userData.auth_provider === 'linkedin_oidc');

        // Load profile data
        console.log('Loading profile data for user:', user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        console.log('Profile data loaded:', data);
        console.log('Profile error:', error);

        if (error && error.code !== 'PGRST116') { // Only show error if it's not a "not found" error
          throw error;
        }

        // If data exists, use it. Otherwise, keep the default empty values
        if (data) {
          console.log('Setting form data with:', data);
          setFormData({
            company_name: data.company_name === null ? '' : data.company_name,
            full_name: data.full_name === null ? '' : data.full_name,
            nip: data.nip === null ? '' : data.nip,
            phone_number: data.phone_number === null ? '' : data.phone_number,
            industry: data.industry === null ? '' : data.industry,
            position: data.position === null ? '' : data.position,
            company_size: data.company_size === null ? '' : data.company_size,
            czy_korzysta_z_erp: data.czy_korzysta_z_erp,
            czy_zamierza_wdrozyc_erp: data.czy_zamierza_wdrozyc_erp,
            czy_dokonal_wyboru_erp: data.czy_dokonal_wyboru_erp,
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Nie udało się załadować profilu');
      }
    };

    loadProfileAndCheckUser();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Clean data before sending
      const cleanNIP = formData.nip.replace(/[^0-9-]/g, '').replace(/-/g, '');
      const cleanPhone = formData.phone_number.replace(/[^0-9]/g, '');

      // Validate NIP
      if (cleanNIP) {
        if (cleanNIP.length !== 10) {
          setErrors(prev => ({ ...prev, nip: 'NIP musi mieć dokładnie 10 cyfr' }));
          setIsSubmitting(false);
          return;
        }
        if (!validateNIP(cleanNIP)) {
          setErrors(prev => ({ ...prev, nip: 'Nieprawidłowy numer NIP' }));
          setIsSubmitting(false);
          return;
        }
      }

      // Validate phone number
      if (cleanPhone && !validatePolishPhone(cleanPhone)) {
        setErrors(prev => ({ ...prev, phone_number: 'Nieprawidłowy numer telefonu' }));
        return;
      }

      console.log('Submitting form data:', formData);
      
      // Prepare update data with current values
      const updateData: Record<string, any> = {
        // Text fields - preserve existing values if not changed
        company_name: formData.company_name.trim() || null,
        full_name: formData.full_name.trim() || null,
        nip: cleanNIP || null,
        phone_number: cleanPhone || null,
        industry: formData.industry.trim() || null,
        position: formData.position.trim() || null,
        company_size: formData.company_size.trim() || null,
        
        // Only include ERP fields if they are not null
        ...(formData.czy_korzysta_z_erp !== null && { czy_korzysta_z_erp: formData.czy_korzysta_z_erp }),
        ...(formData.czy_zamierza_wdrozyc_erp !== null && { czy_zamierza_wdrozyc_erp: formData.czy_zamierza_wdrozyc_erp }),
        ...(formData.czy_dokonal_wyboru_erp !== null && { czy_dokonal_wyboru_erp: formData.czy_dokonal_wyboru_erp })
      };
      
      console.log('Updating profile with:', updateData);

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Check if profile is complete for LinkedIn users
      const isProfileComplete = Boolean(
        formData.company_name &&
        formData.phone_number &&
        cleanNIP &&
        formData.position &&
        formData.industry &&
        formData.company_size
      );

      // For LinkedIn users with complete profiles, check if survey is needed
      if (isLinkedInUser && isProfileComplete) {
        toast.success('Profil został zaktualizowany');
        onClose();
        
        // Trigger onboarding check after a short delay to ensure profile update is saved
        setTimeout(() => {
          checkOnboardingStatus();
        }, 500);
        return;
      }

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

  const formatNIP = (nip: string): string => {
    // Remove any non-digit characters and limit to 10 digits
    const cleanNIP = nip.replace(/[^0-9]/g, '').slice(0, 10);
    
    // Format with dashes
    if (cleanNIP.length <= 3) return cleanNIP;
    if (cleanNIP.length <= 6) return `${cleanNIP.slice(0, 3)}-${cleanNIP.slice(3)}`;
    if (cleanNIP.length <= 8) return `${cleanNIP.slice(0, 3)}-${cleanNIP.slice(3, 6)}-${cleanNIP.slice(6)}`;
    return `${cleanNIP.slice(0, 3)}-${cleanNIP.slice(3, 6)}-${cleanNIP.slice(6, 8)}-${cleanNIP.slice(8)}`;
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
      // Remove any non-digit characters and limit to 10 digits
      const cleanNIP = value.replace(/[^0-9-]/g, '').replace(/-/g, '').slice(0, 10);
      formattedValue = formatNIP(cleanNIP);
      
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
