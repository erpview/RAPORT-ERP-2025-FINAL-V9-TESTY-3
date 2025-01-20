import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, adminSupabase } from '../config/supabase';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { 
  UserCog, 
  Building2, 
  Users, 
  Briefcase, 
  Mail, 
  Phone, 
  UserCircle, 
  AlertCircle,
  Lock,
  CheckSquare,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { INDUSTRY_OPTIONS } from '../constants/industry';
import { COMPANY_SIZE_OPTIONS } from '../constants/company';
import { BLOCKED_DOMAINS } from '../constants/domains';
import { ConsentCheckboxes } from '../components/ConsentCheckboxes';
import { PrivacyPolicyModal } from '../components/PrivacyPolicyModal';
import emailjs from '@emailjs/browser';
import { emailConfig } from '../config/email';
import { formatRegistrationEmailTemplate } from '../utils/emailFormatter';

// Validation helpers
const validateNIP = (nip: string): boolean => {
  const cleanNIP = nip.replace(/[^0-9]/g, '');
  
  if (cleanNIP.length !== 10) {
    return false;
  }

  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += parseInt(cleanNIP[i]) * weights[i];
  }
  
  const checkDigit = sum % 11;
  
  if (checkDigit === 10) {
    return false;
  }
  
  return checkDigit === parseInt(cleanNIP[9]);
};

const formatNIP = (nip: string): string => {
  const cleanNIP = nip.replace(/[^0-9]/g, '').slice(0, 10);
  if (cleanNIP.length <= 3) return cleanNIP;
  if (cleanNIP.length <= 6) return `${cleanNIP.slice(0, 3)}-${cleanNIP.slice(3)}`;
  if (cleanNIP.length <= 8) return `${cleanNIP.slice(0, 3)}-${cleanNIP.slice(3, 6)}-${cleanNIP.slice(6)}`;
  return `${cleanNIP.slice(0, 3)}-${cleanNIP.slice(3, 6)}-${cleanNIP.slice(6, 8)}-${cleanNIP.slice(8)}`;
};

const validatePolishPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const nationalNumber = cleanPhone.replace(/^(48)?/, '');
  return nationalNumber.length === 9 && /^[4-9]/.test(nationalNumber);
};

const formatPolishPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const nationalNumber = cleanPhone.replace(/^(48)?/, '').slice(0, 9);
  
  if (nationalNumber.length === 0) return '';
  if (nationalNumber.length <= 3) return nationalNumber;
  if (nationalNumber.length <= 6) return `${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3)}`;
  return `${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6)}`;
};

const validateEmail = (email: string): boolean => {
  if (!email) {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && BLOCKED_DOMAINS.includes(domain)) {
    return false;
  }

  return true;
};

const validateBusinessEmail = (email: string): boolean => {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  const commonFreeEmailDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'aol.com', 'icloud.com', 'protonmail.com'
  ];
  const domain = email.split('@')[1]?.toLowerCase();
  return !commonFreeEmailDomains.includes(domain);
};

const registerSchema = z.object({
  // Company Information
  companyName: z.string().min(2, 'Nazwa firmy musi mieć minimum 2 znaki'),
  nip: z.string().min(10, 'NIP musi mieć 10 cyfr').max(10, 'NIP musi mieć 10 cyfr'),
  companySize: z.string().min(1, 'Wybierz wielkość firmy'),
  industry: z.string().min(1, 'Wybierz branżę'),
  
  // Contact Information
  fullName: z.string().min(2, 'Imię i nazwisko musi mieć minimum 2 znaki'),
  email: z.string()
    .min(1, 'Email jest wymagany')
    .email('Nieprawidłowy format adresu email')
    .refine((email) => validateEmail(email), 'Proszę użyć służbowego adresu email'),
  phoneNumber: z.string()
    .min(1, 'Numer telefonu jest wymagany')
    .refine(
      (phone) => validatePolishPhone(phone),
      'Nieprawidłowy numer telefonu. Numer musi mieć 9 cyfr i zaczynać się od cyfry 4-9'
    ),
  position: z.string().min(2, 'Stanowisko musi mieć minimum 2 znaki'),
  
  // Password
  password: z.string()
    .min(6, 'Hasło musi mieć minimum 6 znaków')
    .regex(/[A-Z]/, 'Hasło musi zawierać przynajmniej jedną wielką literę')
    .regex(/[0-9]/, 'Hasło musi zawierać przynajmniej jedną cyfrę'),
  confirmPassword: z.string(),
  
  // Consents
  privacyAccepted: z.boolean().refine((val) => val === true, 'Musisz zaakceptować politykę prywatności'),
  marketingAccepted: z.boolean().refine((val) => val === true, 'Musisz wyrazić zgodę na otrzymywanie informacji marketingowych')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const initialFormData: RegisterForm = {
  companyName: '',
  nip: '',
  companySize: '',
  industry: '',
  fullName: '',
  email: '',
  phoneNumber: '',
  position: '',
  password: '',
  confirmPassword: '',
  privacyAccepted: false,
  marketingAccepted: false
};

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Email validation
    if (name === 'email') {
      formattedValue = value;
      if (!validateEmail(value)) {
        setErrors(prev => ({ ...prev, email: 'Proszę użyć służbowego adresu email' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    }

    // Format NIP while typing
    if (name === 'nip') {
      const newNIP = e.target.value.replace(/[^0-9-]/g, '');
      const cleanNIP = newNIP.replace(/-/g, '');
      
      if (cleanNIP.length <= 10) {
        formattedValue = cleanNIP;
        
        if (cleanNIP.length === 10) {
          if (!validateNIP(cleanNIP)) {
            setErrors(prev => ({ ...prev, nip: 'Nieprawidłowy numer NIP' }));
          } else {
            setErrors(prev => ({ ...prev, nip: '' }));
          }
        } else {
          setErrors(prev => ({ ...prev, nip: '' }));
        }
      } else {
        return; // Don't update if more than 10 digits
      }
    }

    // Format phone number while typing
    if (name === 'phoneNumber') {
      const newPhone = value.replace(/[^0-9]/g, '');
      const nationalNumber = newPhone.replace(/^(48)?/, '');
      
      if (nationalNumber.length <= 9) {
        formattedValue = formatPolishPhone(nationalNumber);
        
        if (nationalNumber.length === 9) {
          if (!validatePolishPhone(nationalNumber)) {
            setErrors(prev => ({ ...prev, phoneNumber: 'Nieprawidłowy numer telefonu. Numer musi mieć 9 cyfr i zaczynać się od cyfry 4-9' }));
          } else {
            setErrors(prev => ({ ...prev, phoneNumber: '' }));
          }
        } else {
          setErrors(prev => ({ ...prev, phoneNumber: '' }));
        }
      } else {
        return; // Don't update if more than 9 digits
      }
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    // Clear error when user starts typing
    if (errors[name as keyof RegisterForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate form data
      const validatedData = registerSchema.parse(formData);

      // Clean data before sending
      const cleanNIP = validatedData.nip.replace(/[^0-9]/g, '');
      const cleanPhone = validatedData.phoneNumber.replace(/[^0-9]/g, '');

      // Register user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            full_name: validatedData.fullName,
            company_name: validatedData.companyName,
            phone_number: cleanPhone,
            nip: cleanNIP,
            position: validatedData.position,
            industry: validatedData.industry,
            company_size: validatedData.companySize,
            marketing_accepted: validatedData.marketingAccepted
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Use adminSupabase client to bypass RLS policies
        // Insert user profile data
        const { error: profileError } = await adminSupabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: validatedData.fullName,
            company_name: validatedData.companyName,
            phone_number: cleanPhone,
            nip: cleanNIP,
            position: validatedData.position,
            industry: validatedData.industry,
            company_size: validatedData.companySize,
            status: 'pending',
            marketing_accepted: validatedData.marketingAccepted
          });

        if (profileError) throw profileError;

        // Insert user management record
        const { error: managementError } = await adminSupabase
          .from('user_management')
          .insert({
            user_id: authData.user.id,
            email: validatedData.email,
            role: 'user',
            is_active: false,
            status: 'pending'
          });

        if (managementError) throw managementError;

        // Send registration confirmation email
        try {
          const templateParams = formatRegistrationEmailTemplate(validatedData.email);
          await emailjs.send(
            emailConfig.serviceId,
            emailConfig.registrationTemplateId,
            templateParams,
            emailConfig.publicKey
          );
        } catch (emailError) {
          console.error('Error sending registration email:', emailError);
          // Don't throw error here to allow registration to complete even if email fails
        }

        // Sign out the user after successful registration
        await supabase.auth.signOut();

        toast.success('Rejestracja przebiegła pomyślnie');
        navigate('/rejestracja/sukces');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof RegisterForm, string>> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof RegisterForm] = err.message;
          }
        });
        setErrors(newErrors);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Wystąpił błąd podczas rejestracji');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-semibold text-[#1d1d1f] mb-4">
            Rejestracja
          </h1>
          <p className="text-[17px] text-[#86868b]">
            Wypełnij formularz, aby utworzyć konto
          </p>
          <p className="text-[15px] text-[#86868b] mt-2">
            Dostęp do pełnej wersji raportu jest bezpłatny z wyjątkiem przedstawicieli firm konsultingowych, producentów i dystrybutorów oprogramowania wspomagającego zarządzanie przedsiębiorstwem.
          </p>
        </div>

        <div className="sf-card p-8">
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
                  <label htmlFor="companyName" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Nazwa firmy <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={handleChange}
                      className={`sf-input pl-10 w-full ${errors.companyName ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="np. Firma Sp. z o.o."
                    />
                    {errors.companyName && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.companyName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">{errors.companyName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="nip" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    NIP firmy *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <input
                      id="nip"
                      name="nip"
                      type="text"
                      value={formatNIP(formData.nip)}
                      onChange={handleChange}
                      className={`sf-input pl-10 w-full ${
                        errors.nip ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      placeholder="000-000-00-00"
                    />
                    {errors.nip && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.nip && (
                    <p className="mt-2 text-sm text-red-600">{errors.nip}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="companySize" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Wielkość firmy <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <select
                      id="companySize"
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      className={`sf-input pl-10 pr-10 w-full appearance-none bg-white cursor-pointer hover:bg-[#F5F5F7] transition-colors duration-200 ${
                        errors.companySize ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                    >
                      <option value="">Wybierz przedział</option>
                      {COMPANY_SIZE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.companySize && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.companySize && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">{errors.companySize}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="industry" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Branża <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className={`sf-input pl-10 pr-10 w-full appearance-none bg-white cursor-pointer hover:bg-[#F5F5F7] transition-colors duration-200 ${
                        errors.industry ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                    >
                      <option value="">Wybierz branżę</option>
                      {INDUSTRY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.industry && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.industry && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">{errors.industry}</p>
                  )}
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
                  <label htmlFor="fullName" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Imię i nazwisko <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`sf-input pl-10 w-full ${errors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="np. Jan Kowalski"
                    />
                    {errors.fullName && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.fullName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Email służbowy <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`sf-input pl-10 w-full ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="adres@twojafirma.pl"
                    />
                    {errors.email && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">{errors.email}</p>
                  )}
                  <p className="mt-2 text-sm text-[#86868b]">
                    Wymagany jest służbowy adres email
                  </p>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Numer telefonu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-3 text-[#1d1d1f] bg-gray-100 border border-r-0 border-gray-300 rounded-l-md">
                      +48
                    </span>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                      <input
                        id="phoneNumber"
                        type="tel"
                        name="phoneNumber"
                        required
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className={`sf-input pl-10 w-full rounded-l-none ${
                          errors.phoneNumber ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        placeholder="XXX XXX XXX"
                      />
                      {errors.phoneNumber && (
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-3">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-2 text-sm text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="position" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Stanowisko <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <input
                      id="position"
                      name="position"
                      type="text"
                      required
                      value={formData.position}
                      onChange={handleChange}
                      className={`sf-input pl-10 w-full ${errors.position ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="np. Dyrektor IT"
                    />
                    {errors.position && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.position && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">{errors.position}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-[#0066CC]" />
                <h3 className="text-[21px] font-semibold text-[#1d1d1f]">
                  Hasło
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Hasło <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className={`sf-input pl-10 pr-10 w-full ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Minimum 6 znaków"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                    >
                      {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    {errors.password && (
                      <div className="absolute right-10 top-1/2 transform -translate-y-1/2 pr-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Potwierdź hasło <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`sf-input pl-10 pr-10 w-full ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Powtórz hasło"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                    >
                      {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    {errors.confirmPassword && (
                      <div className="absolute right-10 top-1/2 transform -translate-y-1/2 pr-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-[#86868b]">
                Hasło musi zawierać:
              </p>
              <ul className="list-disc list-inside mt-2">
                <li>Minimum 6 znaków</li>
                <li>Przynajmniej jedną wielką literę</li>
                <li>Przynajmniej jedną cyfrę</li>
              </ul>
            </div>

            {/* Consents Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-6 h-6 text-[#0066CC]" />
                <h3 className="text-[21px] font-semibold text-[#1d1d1f]">
                  Zgody
                </h3>
              </div>

              <ConsentCheckboxes
                marketingAccepted={formData.marketingAccepted}
                privacyAccepted={formData.privacyAccepted}
                onChange={(name, value) => setFormData(prev => ({ ...prev, [name]: value }))}
              />
              {errors.privacyAccepted && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">{errors.privacyAccepted}</p>
              )}
              {errors.marketingAccepted && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">{errors.marketingAccepted}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sf-button-primary w-full justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Rejestracja...
                </>
              ) : (
                'Zarejestruj się'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
