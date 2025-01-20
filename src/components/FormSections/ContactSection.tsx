import React, { useState } from 'react';
import { User, Mail, Phone, AlertCircle, Building2, Briefcase, FileText } from 'lucide-react';
import { BLOCKED_DOMAINS } from '../../constants/domains';

interface ContactSectionProps {
  contactPerson: string;
  email: string;
  phone: string;
  nip: string;
  position: string;
  requirements: string;
  onChange: (field: 'contactPerson' | 'email' | 'phone' | 'nip' | 'position' | 'requirements', value: string) => void;
}

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

const formatNIP = (nip: string): string => {
  const cleanNIP = nip.replace(/[^0-9]/g, '').slice(0, 10);
  if (cleanNIP.length <= 3) return cleanNIP;
  if (cleanNIP.length <= 6) return `${cleanNIP.slice(0, 3)}-${cleanNIP.slice(3)}`;
  if (cleanNIP.length <= 8) return `${cleanNIP.slice(0, 3)}-${cleanNIP.slice(3, 6)}-${cleanNIP.slice(6)}`;
  return `${cleanNIP.slice(0, 3)}-${cleanNIP.slice(3, 6)}-${cleanNIP.slice(6, 8)}-${cleanNIP.slice(8)}`;
};

export const ContactSection: React.FC<ContactSectionProps> = ({
  contactPerson,
  email,
  phone,
  nip,
  position,
  requirements,
  onChange
}) => {
  const [emailError, setEmailError] = useState<string>('');
  const [nipError, setNipError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError('Email jest wymagany');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Nieprawidłowy format adresu email');
      return false;
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && BLOCKED_DOMAINS.includes(domain)) {
      setEmailError('Proszę użyć służbowego adresu email');
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    onChange('email', newEmail);
    validateEmail(newEmail);
  };

  const handleNIPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNIP = e.target.value.replace(/[^0-9-]/g, '');
    const cleanNIP = newNIP.replace(/-/g, '');
    
    if (cleanNIP.length <= 10) {
      onChange('nip', cleanNIP);
      
      if (cleanNIP.length === 10) {
        if (!validateNIP(cleanNIP)) {
          setNipError('Nieprawidłowy numer NIP');
        } else {
          setNipError('');
        }
      } else if (cleanNIP.length < 10) {
        setNipError('NIP musi mieć 10 cyfr');
      } else {
        setNipError('');
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
    onChange('phone', newPhone);
    
    if (newPhone.length === 9) {
      if (!validatePolishPhone(newPhone)) {
        setPhoneError('Nieprawidłowy numer telefonu');
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-[#0066CC]" />
        <h3 className="text-[21px] font-semibold text-[#1d1d1f]">
          Dane kontaktowe
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            Osoba kontaktowa *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
            <input
              required
              type="text"
              value={contactPerson}
              onChange={(e) => onChange('contactPerson', e.target.value)}
              className="sf-input pl-10 w-full"
              placeholder="Imię i nazwisko"
            />
          </div>
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
              value={email}
              onChange={handleEmailChange}
              onBlur={() => validateEmail(email)}
              className={`sf-input pl-10 w-full ${emailError ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="adres@twojafirma.pl"
            />
            {emailError && (
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {emailError && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              {emailError}
            </p>
          )}
          <p className="mt-2 text-sm text-[#86868b]">
            Wymagany jest służbowy adres email
          </p>
        </div>

        <div>
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            NIP firmy *
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
            <input
              required
              type="text"
              value={formatNIP(nip)}
              onChange={handleNIPChange}
              className={`sf-input pl-10 w-full ${nipError ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="000-000-00-00"
            />
            {nipError && (
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pr-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
            )}
          </div>
          {nipError && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              {nipError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            Stanowisko *
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
            <input
              required
              type="text"
              value={position}
              onChange={(e) => onChange('position', e.target.value)}
              className="sf-input pl-10 w-full"
              placeholder="np. Dyrektor IT"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            Telefon komórkowy *
          </label>
          <div className="relative flex">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5 z-10" />
            <span className="inline-flex items-center px-4 pl-10 rounded-l-xl border border-r-0 border-[#d2d2d7] bg-[#F5F5F7] text-[#86868b]">
              +48
            </span>
            <input
              required
              type="tel"
              value={formatPolishPhone(phone)}
              onChange={handlePhoneChange}
              className={`sf-input pl-4 w-full rounded-l-none ${phoneError ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="000 000 000"
            />
          </div>
          {phoneError && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              {phoneError}
            </p>
          )}
          <p className="mt-2 text-sm text-[#86868b]">
            Format: +48 XXX XXX XXX
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
            Dodatkowe wymagania
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 text-[#86868b] w-5 h-5" />
            <textarea
              value={requirements}
              onChange={(e) => onChange('requirements', e.target.value)}
              className="sf-input pl-10 w-full min-h-[120px] resize-y"
              placeholder="Opisz dodatkowe wymagania lub uwagi dotyczące wdrożenia systemu ERP"
            />
          </div>
        </div>
      </div>
    </div>
  );
};