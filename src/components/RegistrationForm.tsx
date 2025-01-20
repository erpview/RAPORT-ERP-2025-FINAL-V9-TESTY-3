import React, { useState } from 'react';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useRouter } from 'react-router-dom';
import { Mail, Phone, Building2, User, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { validateNIP, validatePolishPhone, validateBusinessEmail } from '../utils/validators';

const registrationSchema = z.object({
  companyName: z.string().min(1, 'Nazwa firmy jest wymagana'),
  nip: z.string().refine(validateNIP, 'Nieprawidłowy numer NIP'),
  email: z.string().email().refine(validateBusinessEmail, 'Wymagany służbowy adres email'),
  phone: z.string().refine(validatePolishPhone, 'Nieprawidłowy numer telefonu'),
  position: z.string().min(1, 'Stanowisko jest wymagane'),
  contactPerson: z.string().min(1, 'Imię i nazwisko są wymagane'),
  consents: z.object({
    marketing: z.boolean(),
    terms: z.boolean(),
    privacy: z.boolean()
  })
});

const generateSecurePassword = () => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export const RegistrationForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    nip: '',
    email: '',
    phone: '',
    position: '',
    contactPerson: '',
    consents: {
      marketing: false,
      terms: false,
      privacy: false
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate form data
      registrationSchema.parse(formData);

      setIsSubmitting(true);

      // Create auth user with email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: generateSecurePassword(),
        options: {
          data: {
            role: 'user'
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error('No user data returned');

      // Create user management record
      const { error: managementError } = await supabase
        .from('user_management')
        .insert([
          {
            user_id: authData.user.id,
            email: formData.email,
            company_name: formData.companyName,
            nip: formData.nip,
            phone: formData.phone,
            position: formData.position,
            contact_person: formData.contactPerson,
            role: 'user',
            status: 'pending',
            is_active: false,
            consents: formData.consents
          }
        ]);

      if (managementError) throw managementError;

      toast.success('Rejestracja przebiegła pomyślnie. Oczekuj na zatwierdzenie przez administratora.');
      router.push('/registration-success');

    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            formattedErrors[err.path[0]] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else {
        console.error('Registration error:', error);
        toast.error('Wystąpił błąd podczas rejestracji');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            Nazwa firmy *
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
            <input
              required
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className={`sf-input pl-10 w-full ${errors.companyName ? 'border-red-500' : ''}`}
              placeholder="Nazwa firmy"
            />
          </div>
          {errors.companyName && (
            <p className="mt-2 text-sm text-red-600">{errors.companyName}</p>
          )}
        </div>

        <div>
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            NIP *
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
            <input
              required
              type="text"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              className={`sf-input pl-10 w-full ${errors.nip ? 'border-red-500' : ''}`}
              placeholder="000-000-00-00"
            />
          </div>
          {errors.nip && (
            <p className="mt-2 text-sm text-red-600">{errors.nip}</p>
          )}
        </div>

        <div>
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            Email służbowy *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`sf-input pl-10 w-full ${errors.email ? 'border-red-500' : ''}`}
              placeholder="adres@twojafirma.pl"
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            Telefon *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
            <input
              required
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`sf-input pl-10 w-full ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="000 000 000"
            />
          </div>
          {errors.phone && (
            <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            Stanowisko *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
            <input
              required
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className={`sf-input pl-10 w-full ${errors.position ? 'border-red-500' : ''}`}
              placeholder="Twoje stanowisko"
            />
          </div>
          {errors.position && (
            <p className="mt-2 text-sm text-red-600">{errors.position}</p>
          )}
        </div>

        <div>
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            Osoba kontaktowa *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
            <input
              required
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className={`sf-input pl-10 w-full ${errors.contactPerson ? 'border-red-500' : ''}`}
              placeholder="Imię i nazwisko"
            />
          </div>
          {errors.contactPerson && (
            <p className="mt-2 text-sm text-red-600">{errors.contactPerson}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.consents.terms}
            onChange={(e) => setFormData({
              ...formData,
              consents: { ...formData.consents, terms: e.target.checked }
            })}
            className="sf-checkbox mt-1"
            required
          />
          <span className="text-sm text-[#1d1d1f]">
            Akceptuję regulamin i politykę prywatności *
          </span>
        </div>

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.consents.privacy}
            onChange={(e) => setFormData({
              ...formData,
              consents: { ...formData.consents, privacy: e.target.checked }
            })}
            className="sf-checkbox mt-1"
            required
          />
          <span className="text-sm text-[#1d1d1f]">
            Wyrażam zgodę na przetwarzanie moich danych osobowych *
          </span>
        </div>

        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.consents.marketing}
            onChange={(e) => setFormData({
              ...formData,
              consents: { ...formData.consents, marketing: e.target.checked }
            })}
            className="sf-checkbox mt-1"
          />
          <span className="text-sm text-[#1d1d1f]">
            Wyrażam zgodę na otrzymywanie informacji marketingowych
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="sf-button-primary w-full justify-center"
      >
        {isSubmitting ? 'Rejestracja...' : 'Zarejestruj się'}
      </button>
    </form>
  );
};
