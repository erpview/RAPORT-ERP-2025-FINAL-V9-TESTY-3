import { MODULE_NAMES, SYSTEM_VERSION_NAMES, BUSINESS_QUESTION_LABELS } from '../config/emailTemplate';
import { formatPhone } from './formatters';

interface FormData {
  companyName: string;
  industry: string;
  employees: string;
  currentSystem: string;
  systemVersion: string;
  modules: string[];
  moduleUsers: Record<string, number>;
  businessAnswers: Record<string, boolean>;
  decisionDate: string;
  implementationDate: string;
  contactPerson: string;
  email: string;
  nip: string;
  position: string;
  phone: string;
  requirements?: string;
}

interface ApprovalDetailsData {
  email: string;
  fullName: string;
  companyName: string;
  nip: string;
  companySize: string;
  industry: string;
  phoneNumber: string;
  position: string;
}

export const formatEmailTemplate = (formData: FormData) => {
  // Format modules section
  const modulesSection = formData.modules
    .map(moduleId => {
      const moduleName = moduleId in MODULE_NAMES 
        ? MODULE_NAMES[moduleId as keyof typeof MODULE_NAMES] 
        : moduleId;
      const userCount = moduleId in formData.moduleUsers 
        ? formData.moduleUsers[moduleId as keyof typeof formData.moduleUsers] 
        : 0;
      return `${moduleName}: ${userCount} użytkowników`;
    })
    .join('\n');

  // Format company operations section
  const companyOperations = Object.entries(formData.businessAnswers)
    .map(([key, value]) => {
      const label = key in BUSINESS_QUESTION_LABELS 
        ? BUSINESS_QUESTION_LABELS[key as keyof typeof BUSINESS_QUESTION_LABELS] 
        : key;
      return `${label}: ${value ? 'Tak' : 'Nie'}`;
    })
    .join('\n');

  // Format dates
  const formatDate = (date: string) => {
    if (!date) return 'Nie określono';
    return new Date(date).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Prepare template parameters
  const templateParams = {
    // Company Details
    company_name: formData.companyName,
    industry: formData.industry,
    employee_count: formData.employees,
    current_system: formData.currentSystem || 'Nie określono',
    system_version: formData.systemVersion in SYSTEM_VERSION_NAMES 
      ? SYSTEM_VERSION_NAMES[formData.systemVersion as keyof typeof SYSTEM_VERSION_NAMES] 
      : 'Nie określono',

    // Modules and Operations
    modules_section: modulesSection,
    company_operations: companyOperations,

    // Timeline
    decision_date: formatDate(formData.decisionDate),
    implementation_date: formatDate(formData.implementationDate),

    // Contact Information
    contact_name: formData.contactPerson,
    business_email: formData.email,
    tax_id: formData.nip,
    position: formData.position,
    mobile: formatPhone(formData.phone),
    additional_requirements: formData.requirements || 'Brak dodatkowych wymagań'
  };

  return templateParams;
};

export const formatRegistrationEmailTemplate = (email: string) => {
  return {
    to_email: email,
  };
};

export const formatApprovalEmailTemplate = (email: string) => {
  return {
    to_email: email
  };
};

export const formatApprovalDetailsEmailTemplate = (userData: ApprovalDetailsData) => {
  return {
    to_email: userData.email,
    full_name: userData.fullName,
    company_name: userData.companyName,
    nip: userData.nip,
    company_size: userData.companySize,
    industry: userData.industry,
    phone_number: userData.phoneNumber,
    position: userData.position
  };
};