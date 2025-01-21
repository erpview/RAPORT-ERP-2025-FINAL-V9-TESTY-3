import React, { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { DynamicField } from './DynamicField';
import { useSystemFields } from '../hooks/useSystemFields';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

interface SystemFormProps {
  system?: any;
  fields: any[];
  isCreating?: boolean;
  isSaving?: boolean;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const SystemForm: React.FC<SystemFormProps> = ({
  system,
  fields,
  isCreating,
  isSaving,
  onSave,
  onCancel
}) => {
  const { modules, getFieldValues } = useSystemFields();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    if (system?.id) {
      loadFieldValues();
      // Always start with empty review notes when editing
      setReviewNotes('');
    }
  }, [system?.id, fields]);

  const loadFieldValues = async () => {
    if (!system?.id) return;
    
    try {
      const values = await getFieldValues(system.id);
      const valueMap = values.reduce((acc, val) => ({
        ...acc,
        [val.field_id]: val.value
      }), {});
      
      // Add core system values to the field values
      const coreFields = {
        name: fields.find(f => f.field_key === 'system_name'),
        vendor: fields.find(f => f.field_key === 'supplier'),
        website: fields.find(f => f.field_key === 'website'),
        size: fields.find(f => f.field_key === 'company_size'),
        description: fields.find(f => f.field_key === 'description'),
      };
      
      if (coreFields.name?.id) valueMap[coreFields.name.id] = system.name || '';
      if (coreFields.vendor?.id) valueMap[coreFields.vendor.id] = system.vendor || '';
      if (coreFields.website?.id) valueMap[coreFields.website.id] = system.website || '';
      if (coreFields.size?.id) {
        // Handle size as a comma-separated string for multiselect
        const sizeValue = Array.isArray(system.size) ? system.size.join(',') : system.size || '';
        valueMap[coreFields.size.id] = sizeValue;
      }
      if (coreFields.description?.id) valueMap[coreFields.description.id] = system.description || '';
      
      setFieldValues(valueMap);
    } catch (error) {
      console.error('Error loading field values:', error);
      toast.error('Failed to load field values');
    }
  };

  const validateField = (field: any, value: string | string[] | null | undefined) => {
    // Special handling for multiselect fields
    if (field.field_type === 'multiselect') {
      let values: string[] = [];
      if (Array.isArray(value)) {
        values = value;
      } else if (typeof value === 'string') {
        values = value.split(',').filter(v => v.trim() !== '');
      }
      if (field.is_required && values.length === 0) {
        return 'Please select at least one option';
      }
      return '';
    }
    
    // For other fields - convert to string
    const stringValue = String(value || '');
    
    // For other fields
    if (field.is_required && !stringValue.trim()) {
      return 'This field is required';
    }
    
    if (stringValue.trim()) {
      switch (field.field_type) {
        case 'email':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
            return 'Invalid email address';
          }
          break;
        case 'url':
          try {
            new URL(stringValue);
          } catch {
            return 'Invalid URL';
          }
          break;
      }
    }
    
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    fields.forEach(field => {
      const error = validateField(field, fieldValues[field.id] || '');
      if (error) {
        newErrors[field.id] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Validate review notes
    if (!isCreating && !reviewNotes.trim()) {
      setErrors(prev => ({
        ...prev,
        reviewNotes: 'Uwagi do przeglądu są wymagane'
      }));
      return;
    }

    try {
      // Get core fields
      const coreFields = {
        name: fields.find(f => f.field_key === 'system_name'),
        vendor: fields.find(f => f.field_key === 'supplier'),
        website: fields.find(f => f.field_key === 'website'),
        size: fields.find(f => f.field_key === 'company_size'),
        description: fields.find(f => f.field_key === 'description'),
      };

      // Log for debugging
      console.log('Core fields:', coreFields);
      console.log('All fields:', fields.map(f => ({ id: f.id, name: f.name, key: f.field_key })));
      console.log('Field values:', fieldValues);

      // Validate required core fields
      if (!coreFields.name?.id || !fieldValues[coreFields.name.id]) {
        setErrors(prev => ({
          ...prev,
          [coreFields.name?.id || '']: 'Nazwa systemu jest wymagana'
        }));
        return;
      }

      if (!coreFields.vendor?.id || !fieldValues[coreFields.vendor.id]) {
        setErrors(prev => ({
          ...prev,
          [coreFields.vendor?.id || '']: 'Dostawca jest wymagany'
        }));
        return;
      }

      // Extract system data
      const systemData = {
        name: fieldValues[coreFields.name.id],
        vendor: fieldValues[coreFields.vendor.id],
        website: fieldValues[coreFields.website?.id || ''],
        size: fieldValues[coreFields.size?.id || ''] ? [fieldValues[coreFields.size?.id]] : ['Small'], // Ensure size is always an array
        description: fieldValues[coreFields.description?.id || ''],
        review_notes: !isCreating ? reviewNotes : undefined,
      };

      // Log for debugging
      console.log('System data to save:', systemData);

      // Call the parent's onSave handler with separated data
      await onSave({
        system: systemData,
        fieldValues: fieldValues
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save system');
    }
  };

  const handleFieldChange = (fieldId: string, value: string | string[]) => {
    setFieldValues(prev => {
      const newValues = { ...prev };
      
      // Special handling for multiselect fields
      const field = fields.find(f => f.id === fieldId);
      if (field?.field_type === 'multiselect') {
        // Handle array of values from MultiSelect component
        if (Array.isArray(value)) {
          newValues[fieldId] = value.join(',');
        } else {
          // Handle string value (comma-separated)
          const values = value.split(',').map(v => v.trim()).filter(Boolean);
          newValues[fieldId] = values.join(',');
        }
      } else {
        newValues[fieldId] = String(value || ''); // Ensure we always store a string
      }
      
      return newValues;
    });
    
    // Clear error when field is changed
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  if (modules === null) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[#eaeaea] p-6 rounded-lg border border-[#eaeaea]">
      <div className="space-y-6">
        {modules.map(module => (
          <Card key={module.id} className="p-6">
            <h3 className="text-lg font-semibold mb-4">{module.name}</h3>
            <div className="space-y-6">
              {fields
                .filter(field => field.module_id === module.id)
                .map(field => (
                  <DynamicField
                    key={field.id}
                    field={field}
                    value={fieldValues[field.id] || ''}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    error={errors[field.id]}
                  />
                ))}
            </div>
          </Card>
        ))}

        {!isCreating && (
          <Card className="p-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Uwagi do przeglądu *
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className={`w-full p-2 border rounded-md ${
                  errors.reviewNotes ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={4}
                placeholder="Opisz wprowadzone zmiany w systemie..."
              />
              {errors.reviewNotes && (
                <p className="text-sm text-red-500">{errors.reviewNotes}</p>
              )}
            </div>
          </Card>
        )}
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button 
          type="button" 
          variant="secondary"
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-2 bg-[#f5f5f7] text-[#1d1d1f] border border-[#d2d2d7] hover:bg-[#e8e8ed] transition-colors"
        >
          Anuluj
        </Button>
        <Button 
          type="submit"
          variant="primary"
          disabled={isSaving}
          className="px-6 py-2 bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors"
        >
          {isSaving ? 'Zapisywanie...' : 'Zapisz'}
        </Button>
      </div>
    </form>
  );
};