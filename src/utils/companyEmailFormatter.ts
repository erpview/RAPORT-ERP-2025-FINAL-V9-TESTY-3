import { Company } from '../types/company';

export const formatCompanyUpdateTemplate = (
  company: Partial<Company>,
  action: 'created' | 'updated',
  editorEmail: string
) => {
  return {
    company_name: company.name,
    company_nip: company.nip,
    company_email: company.email,
    company_phone: company.phone,
    company_address: `${company.street}, ${company.postal_code} ${company.city}`,
    company_website: company.website || 'Nie podano',
    company_description: company.description,
    action_type: action === 'created' ? 'dodana' : 'zaktualizowana',
    editor_email: editorEmail,
    timestamp: new Date().toLocaleString('pl-PL')
  };
};
