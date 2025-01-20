import React, { useState } from 'react';
import { 
  X, 
  Loader2, 
  AlertCircle,
  UserCog, 
  Building2, 
  Users, 
  Briefcase, 
  Mail, 
  Phone, 
  UserCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { adminSupabase } from '../config/supabase';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { INDUSTRY_OPTIONS } from '../constants/industry';
import { COMPANY_SIZE_OPTIONS } from '../constants/company';

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

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

const validatePolishPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length !== 9) return false;
  return /^[4-9]\d{8}$/.test(cleanPhone);
};

const validateEmail = (email: string): boolean => {
  const commonFreeEmailDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
    'aol.com', 'icloud.com', 'protonmail.com'
  ];
  const domain = email.split('@')[1]?.toLowerCase();
  return !commonFreeEmailDomains.includes(domain);
};

const userSchema = z.object({
  // Company Information
  companyName: z.string().min(2, 'Nazwa firmy musi mieć minimum 2 znaki'),
  nip: z.string().min(10, 'NIP musi mieć 10 cyfr').max(10, 'NIP musi mieć 10 cyfr')
    .refine(validateNIP, 'Nieprawidłowy numer NIP'),
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
  
  // Account Settings
  password: z.string()
    .min(6, 'Hasło musi mieć minimum 6 znaków')
    .regex(/[A-Z]/, 'Hasło musi zawierać przynajmniej jedną wielką literę')
    .regex(/[0-9]/, 'Hasło musi zawierać przynajmniej jedną cyfrę'),
  role: z.enum(['admin', 'editor', 'user'])
});

type UserForm = z.infer<typeof userSchema>;

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<UserForm>({
    companyName: '',
    nip: '',
    companySize: '',
    industry: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    position: '',
    password: '',
    role: 'user'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phoneError, setPhoneError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validatePhoneNumber = (value: string) => {
    if (!value) return '';
    if (value.length > 0 && !['4','5','6','7','8','9'].includes(value[0])) {
      return 'Numer telefonu musi zaczynać się od cyfry 4-9';
    }
    return '';
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 9) {
      setFormData({ ...formData, phoneNumber: value });
      setPhoneError(validatePhoneNumber(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      userSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            formattedErrors[err.path[0]] = err.message;
          }
        });
        setErrors(formattedErrors);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // First check if user exists
      const { data: existingUsers } = await adminSupabase
        .from('user_management')
        .select('*')
        .eq('email', formData.email)
        .single();

      if (existingUsers) {
        toast.error('Użytkownik z tym adresem email już istnieje');
        setIsSubmitting(false);
        return;
      }

      // Create user in auth.users using admin client
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        app_metadata: {
          role: formData.role
        }
      });

      if (authError) {
        if (authError.message.includes('already been registered')) {
          toast.error('Użytkownik z tym adresem email już istnieje');
        } else {
          throw authError;
        }
        return;
      }

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      // Create user profile first
      const { error: profileError } = await adminSupabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            full_name: formData.fullName,
            company_name: formData.companyName,
            phone_number: formData.phoneNumber,
            nip: formData.nip,
            position: formData.position,
            industry: formData.industry,
            company_size: formData.companySize,
            status: 'active',
            marketing_accepted: true // Since admin is creating the user
          }
        ]);

      if (profileError) throw profileError;

      // Then create user management record
      const { error: managementError } = await adminSupabase
        .from('user_management')
        .insert([
          {
            user_id: authData.user.id,
            email: formData.email,
            role: formData.role,
            is_active: true,
            status: 'active'
          }
        ]);

      if (managementError) throw managementError;

      toast.success('Użytkownik został utworzony');
      onSuccess();
      onClose();
      setFormData({
        companyName: '',
        nip: '',
        companySize: '',
        industry: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        position: '',
        password: '',
        role: 'user'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Nie udało się utworzyć użytkownika');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[24px] font-semibold text-[#1d1d1f]">
              Dodaj nowego użytkownika
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
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
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className={`sf-input pl-10 w-full ${errors.companyName ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="np. Twoja Firma Sp. z o.o."
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
                    NIP <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCog className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <input
                      id="nip"
                      name="nip"
                      type="text"
                      required
                      maxLength={10}
                      value={formData.nip}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        if (value.length <= 10) {
                          setFormData({ ...formData, nip: value });
                        }
                      }}
                      className={`sf-input pl-10 w-full ${errors.nip ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="0000000000"
                    />
                    {errors.nip && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {errors.nip && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">{errors.nip}</p>
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
                      onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                      className={`sf-input pl-10 pr-10 w-full appearance-none bg-white cursor-pointer hover:bg-[#F5F5F7] transition-colors duration-200 ${
                        errors.companySize ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      required
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
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className={`sf-input pl-10 pr-10 w-full appearance-none bg-white cursor-pointer hover:bg-[#F5F5F7] transition-colors duration-200 ${
                        errors.industry ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                      required
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
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                        maxLength={9}
                        value={formData.phoneNumber}
                        onChange={handlePhoneChange}
                        className={`sf-input pl-10 w-full rounded-l-none ${
                          (errors.phoneNumber || phoneError) ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        placeholder="500 600 700"
                      />
                      {(errors.phoneNumber || phoneError) && (
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-3">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-2 text-sm text-red-600">{errors.phoneNumber}</p>
                  )}
                  {phoneError && (
                    <p className="mt-2 text-sm text-red-600">{phoneError}</p>
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
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
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

            {/* Account Settings Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <UserCog className="w-6 h-6 text-[#0066CC]" />
                <h3 className="text-[21px] font-semibold text-[#1d1d1f]">
                  Ustawienia konta
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Hasło <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCog className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`sf-input pl-10 pr-10 w-full ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Minimum 6 znaków"
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
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="role" className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                    Rola <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCog className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'editor' | 'user' })}
                      className={`sf-input pl-10 pr-10 w-full appearance-none bg-white cursor-pointer hover:bg-[#F5F5F7] transition-colors duration-200`}
                      required
                    >
                      <option value="user">Użytkownik</option>
                      <option value="editor">Edytor</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 sticky bottom-0 pt-4 bg-white border-t">
              <button
                type="button"
                onClick={onClose}
                className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
                disabled={isSubmitting}
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="sf-button-primary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Tworzenie...
                  </>
                ) : (
                  'Utwórz użytkownika'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};