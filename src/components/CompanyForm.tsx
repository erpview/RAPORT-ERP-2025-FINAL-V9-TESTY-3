import React, { useState, useEffect } from 'react';
import { Company } from '../types/company';
import { useAuth } from '../context/AuthContext';
import { BLOCKED_DOMAINS } from '../constants/domains';
import { useCompanyFields } from '../hooks/useCompanyFields';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { DynamicField } from './DynamicField';
import toast from 'react-hot-toast';
import type { SystemField } from '../hooks/useSystemFields';
import { validateNIP } from '../utils/validators';

// Custom slugify function
const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/-+/g, '-');     // Replace multiple - with single -
};

interface CompanyFormProps {
  company?: Partial<Company>;
  onSubmit: (data: Partial<Company>) => void;
  isLoading?: boolean;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
  company,
  onSubmit,
  isLoading = false,
}) => {
  const { user, isAdmin } = useAuth();
  const { modules, fields, getFieldValues, saveFieldValues } = useCompanyFields();
  const [formData, setFormData] = useState<Partial<Company>>({
    name: '',
    street: '',
    postal_code: '',
    city: '',
    phone: '',
    website: '',
    email: '',
    nip: '',
    logo_url: '',
    description: '',
    status: 'draft',
    slug: '',
    meta_title: '',
    meta_description: '',
    canonical_url: '',
    module_values: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when company prop changes
  useEffect(() => {
    const initializeForm = async () => {
      if (company) {
        // Initialize module_values with proper types
        const initialModuleValues: Record<string, Record<string, any>> = {};
        
        // Initialize all modules with empty objects
        modules.forEach(module => {
          initialModuleValues[module.id] = {};
          
          // Get fields for this module
          const moduleFieldDefs = fields.filter(f => f.module_id === module.id);
          
          // Initialize all fields with default values based on their type
          moduleFieldDefs.forEach(field => {
            let defaultValue;
            switch (field.field_type) {
              case 'boolean':
                defaultValue = false;
                break;
              case 'number':
                defaultValue = 0;
                break;
              case 'multiselect':
                defaultValue = [];
                break;
              default:
                defaultValue = '';
            }
            initialModuleValues[module.id][field.field_key] = defaultValue;
          });
        });

        // If we have an existing company with field values
        if (company.id && company.company_field_values?.length) {
          // Process each field value
          company.company_field_values.forEach(fieldValue => {
            const field = fields.find(f => f.id === fieldValue.field_id);
            if (!field) return;
            
            const value = fieldValue.value;
            
            // Convert value based on field type
            switch (field.field_type) {
              case 'boolean':
                initialModuleValues[field.module_id][field.field_key] = value === 'true';
                break;
              case 'number':
                initialModuleValues[field.module_id][field.field_key] = Number(value) || 0;
                break;
              case 'multiselect':
                initialModuleValues[field.module_id][field.field_key] = value ? value.split(',').map(v => v.trim()) : [];
                break;
              default:
                initialModuleValues[field.module_id][field.field_key] = value;
            }
          });
        }

        setFormData({
          name: company.name || '',
          street: company.street || '',
          postal_code: company.postal_code || '',
          city: company.city || '',
          phone: company.phone || '',
          website: company.website || '',
          email: company.email || '',
          nip: company.nip || '',
          logo_url: company.logo_url || '',
          description: company.description || '',
          status: company.status || 'draft',
          slug: company.slug || '',
          meta_title: company.meta_title || '',
          meta_description: company.meta_description || '',
          canonical_url: company.canonical_url || '',
          module_values: initialModuleValues,
        });
      }
    };

    initializeForm();
  }, [company, fields, modules]);

  // Generate slug from name
  useEffect(() => {
    const name = formData.name;
    if (typeof name === 'string' && name && !company?.slug) {
      setFormData(prev => ({
        ...prev,
        slug: createSlug(name)
      }));
    }
  }, [formData.name, company?.slug]);

  const validateEmail = (email: string | undefined): boolean => {
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email jest wymagany' }));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Nieprawidłowy format adresu email' }));
      return false;
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && BLOCKED_DOMAINS.includes(domain)) {
      setErrors(prev => ({ ...prev, email: 'Proszę użyć służbowego adresu email' }));
      return false;
    }

    return true;
  };

  const validatePostalCode = (code: string) => {
    const pattern = /^\d{2}-\d{3}$/;
    return pattern.test(code);
  };

  const validatePhone = (phone: string) => {
    const pattern = /^\+?[0-9]{9,12}$/;
    return pattern.test(phone);
  };

  const validateNip = (nip: string) => {
    return validateNIP(nip);
  };

  const formatPostalCode = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as XX-XXX
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}`;
  };

  const formatPhone = (value: string) => {
    // Remove all non-digits and non-plus sign
    let formatted = value.replace(/[^\d+]/g, '');
    
    // Ensure plus sign is only at the start
    if (formatted.includes('+') && !formatted.startsWith('+')) {
      formatted = formatted.replace(/\+/g, '');
    }
    
    // Limit length (12 digits + optional plus sign)
    if (formatted.startsWith('+')) {
      return formatted.slice(0, 13); // +12 digits
    }
    return formatted.slice(0, 12); // 12 digits
  };

  const formatNip = (value: string) => {
    // Remove any non-digit characters
    let formatted = value.replace(/[^0-9]/g, '');
    
    // Limit to 10 digits
    formatted = formatted.slice(0, 10);
    
    // Add dashes after 3rd and 6th digits if we have enough digits
    if (formatted.length > 6) {
      formatted = `${formatted.slice(0, 3)}-${formatted.slice(3, 6)}-${formatted.slice(6, 8)}-${formatted.slice(8)}`;
    } else if (formatted.length > 3) {
      formatted = `${formatted.slice(0, 3)}-${formatted.slice(3)}`;
    }
    
    return formatted;
  };

  const handleChange = (name: string, value: any) => {
    // Format postal code as user types
    if (name === 'postal_code') {
      value = formatPostalCode(value);
      if (value.length > 6) return; // Don't allow more than XX-XXX
    }

    // Format phone number as user types
    if (name === 'phone') {
      value = formatPhone(value);
    }

    // Format and validate NIP as user types
    if (name === 'nip') {
      value = formatNip(value);
      // Only validate if we have all 10 digits (12 chars with dashes)
      if (value.replace(/[^0-9]/g, '').length === 10) {
        if (!validateNip(value)) {
          setErrors(prev => ({ ...prev, nip: 'Nieprawidłowy numer NIP' }));
        } else {
          setErrors(prev => ({ ...prev, nip: '' }));
        }
      } else {
        setErrors(prev => ({ ...prev, nip: '' }));
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field if exists (except NIP which is handled above)
    if (errors[name] && name !== 'nip') {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate postal code
    if (formData.postal_code && !validatePostalCode(formData.postal_code)) {
      toast.error('Kod pocztowy musi być w formacie XX-XXX (np. 12-345)');
      return;
    }

    // Validate phone number
    if (formData.phone && !validatePhone(formData.phone)) {
      toast.error('Numer telefonu musi zawierać od 9 do 12 cyfr, opcjonalnie rozpoczynając się od +');
      return;
    }

    // Validate NIP if provided
    if (formData.nip && !validateNip(formData.nip)) {
      toast.error('Nieprawidłowy numer NIP');
      return;
    }

    try {
      // First save the company data
      await onSubmit(formData);
      
      // If we have a company ID, save the field values
      if (company?.id) {
        // Convert module_values to field values format
        const fieldValues: Record<string, string> = {};
        
        Object.entries(formData.module_values || {}).forEach(([moduleId, moduleFields]) => {
          Object.entries(moduleFields).forEach(([fieldKey, value]) => {
            // Find the field definition
            const field = fields.find(f => f.module_id === moduleId && f.field_key === fieldKey);
            if (!field) return;
            
            // Convert value to string based on field type
            let stringValue: string;
            if (Array.isArray(value)) {
              stringValue = value.join(',');
            } else if (typeof value === 'boolean') {
              stringValue = value.toString();
            } else if (value === null || value === undefined) {
              stringValue = '';
            } else {
              stringValue = value.toString();
            }
            
            fieldValues[field.id] = stringValue;
          });
        });
        
        // Save field values
        await saveFieldValues(company.id, fieldValues);
      }
    } catch (error) {
      console.error('Error saving company data:', error);
      throw error;
    }
  };

  const handleModuleFieldChange = (moduleId: string, fieldKey: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      module_values: {
        ...prev.module_values,
        [moduleId]: {
          ...(prev.module_values?.[moduleId] || {}),
          [fieldKey]: value
        }
      }
    }));
  };

  // Helper function to create field config
  const createFieldConfig = (
    id: string, 
    name: string, 
    type: string, 
    required: boolean,
    description?: string
  ): SystemField => ({
    id,
    name,
    field_type: type,
    is_required: required,
    module_id: 'company',
    field_key: id,
    description: description || null,
    options: null,
    order_index: 0
  });

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
      <Card>
        <div className="p-6">
          <Card.Title>Informacje o firmie</Card.Title>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <DynamicField
                field={createFieldConfig('name', 'Nazwa firmy', 'text', true)}
                value={formData.name || ''}
                onChange={(value) => handleChange('name', value)}
                error={errors.name}
              />

              <DynamicField
                field={createFieldConfig(
                  'nip', 
                  'NIP', 
                  'text', 
                  true,
                  'Format: XXX-XXX-XX-XX (np. 123-456-78-90)'
                )}
                value={formData.nip || ''}
                onChange={(value) => handleChange('nip', value)}
                error={errors.nip}
              />

              <DynamicField
                field={createFieldConfig('website', 'Strona WWW', 'url', false)}
                value={formData.website || ''}
                onChange={(value) => handleChange('website', value)}
                error={errors.website}
              />

              <DynamicField
                field={createFieldConfig('logo_url', 'Logo URL', 'url', false,
                  'Wklej adres url do logotypu w formacie jpg lub png o wymiarach: szerokość 600 px oraz wysokość 192 px')}
                value={formData.logo_url || ''}
                onChange={(value) => handleChange('logo_url', value)}
                error={errors.logo_url}
              />
            </div>

            <div className="space-y-4">
              <DynamicField
                field={createFieldConfig('street', 'Ulica', 'text', true)}
                value={formData.street || ''}
                onChange={(value) => handleChange('street', value)}
                error={errors.street}
              />

              <DynamicField
                field={createFieldConfig(
                  'postal_code', 
                  'Kod pocztowy', 
                  'text', 
                  true,
                  'Format: XX-XXX (np. 12-345)'
                )}
                value={formData.postal_code || ''}
                onChange={(value) => handleChange('postal_code', value)}
                error={errors.postal_code}
              />

              <DynamicField
                field={createFieldConfig('city', 'Miasto', 'text', true)}
                value={formData.city || ''}
                onChange={(value) => handleChange('city', value)}
                error={errors.city}
              />

              <DynamicField
                field={createFieldConfig(
                  'phone', 
                  'Telefon', 
                  'text', 
                  true,
                  'Format: 9-12 cyfr, opcjonalnie rozpoczynając się od + (np. +48123456789 lub 123456789)'
                )}
                value={formData.phone || ''}
                onChange={(value) => handleChange('phone', value)}
                error={errors.phone}
              />

              <DynamicField
                field={createFieldConfig('email', 'Email', 'email', true)}
                value={formData.email || ''}
                onChange={(value) => handleChange('email', value)}
                error={errors.email}
              />
            </div>
          </div>

          <div className="mt-6">
            <DynamicField
              field={createFieldConfig('description', 'Opis', 'textarea', true)}
              value={formData.description || ''}
              onChange={(value) => handleChange('description', value)}
              error={errors.description}
            />
          </div>
        </div>
      </Card>

      {/* Additional Fields Section */}
      {user && modules.length > 0 && (
        <Card>
          <div className="p-6">
            <Card.Title>Informacje dodatkowe</Card.Title>
            <div className="space-y-6">
              {modules
                .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                .map(module => {
                  const moduleFields = fields.filter(field => field.module_id === module.id);
                  if (moduleFields.length === 0) return null;

                  return (
                    <div key={module.id} className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">{module.name}</h3>
                      {module.description && (
                        <p className="text-sm text-gray-500">{module.description}</p>
                      )}
                      <div className="space-y-4">
                        {moduleFields
                          .sort((a, b) => a.order_index - b.order_index)
                          .map(field => (
                            <DynamicField
                              key={field.id}
                              field={field}
                              value={formData.module_values?.[module.id]?.[field.field_key] ?? (field.field_type === 'multiselect' ? [] : '')}
                              onChange={(value) => handleModuleFieldChange(module.id, field.field_key, value)}
                              error={errors[`${module.id}_${field.field_key}`]}
                            />
                          ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </Card>
      )}

      {/* SEO Section - Only visible for admin users */}
      {isAdmin && (
        <Card>
          <div className="p-6">
            <Card.Title>Informacje SEO</Card.Title>
            <div className="space-y-4">
              <DynamicField
                field={createFieldConfig('meta_title', 'Meta tytuł', 'text', false)}
                value={formData.meta_title || ''}
                onChange={(value) => handleChange('meta_title', value)}
                error={errors.meta_title}
              />

              <DynamicField
                field={createFieldConfig('meta_description', 'Meta opis', 'textarea', false)}
                value={formData.meta_description || ''}
                onChange={(value) => handleChange('meta_description', value)}
                error={errors.meta_description}
              />

              <DynamicField
                field={createFieldConfig('canonical_url', 'URL kanoniczny', 'text', false)}
                value={formData.canonical_url || ''}
                onChange={(value) => handleChange('canonical_url', value)}
                error={errors.canonical_url}
              />
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isLoading}
        >
          {company ? 'Zapisz zmiany' : 'Dodaj firmę'}
        </Button>
      </div>
    </form>
  );
};
