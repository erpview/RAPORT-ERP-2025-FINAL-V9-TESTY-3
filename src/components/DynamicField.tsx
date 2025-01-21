import React from 'react';
import { Input, Select, TextArea, Toggle } from './ui';
import { MultiSelect } from './ui/MultiSelect';
import type { SystemField } from '../hooks/useSystemFields';

interface DynamicFieldProps {
  field: SystemField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  error
}) => {
  const handleChange = (newValue: any) => {
    // For multiselect, we get an array of values
    if (field.field_type === 'multiselect') {
      if (Array.isArray(newValue)) {
        onChange(newValue);
      } else {
        // Split by comma and clean up any whitespace
        const values = (newValue || '').split(',').map(v => v.trim()).filter(Boolean);
        onChange(values);
      }
    } else {
      onChange(newValue || '');
    }
  };

  const getFieldValue = () => {
    if (field.field_type === 'multiselect') {
      // Handle both string and array values
      if (Array.isArray(value)) {
        return value;
      }
      // Split by comma and clean up any whitespace
      return (value || '').split(',').map((v: string) => v.trim()).filter(Boolean);
    }
    return value || '';
  };

  const getOptions = () => {
    return field.options?.map(opt => ({
      value: opt,
      label: opt
    })) || [];
  };

  const getLabel = () => {
    return field.name;
  };

  switch (field.field_type) {
    case 'text':
    case 'email':
    case 'url':
      return (
        <div key={field.id} className="space-y-2">
          <label className="block text-[17px] font-medium text-[#1d1d1f]">
            {field.name} {field.is_required && '*'}
          </label>
          <input
            type={field.field_type === 'email' ? 'email' : field.field_type === 'url' ? 'url' : 'text'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="sf-input w-full h-12"
            placeholder={`Enter ${field.name.toLowerCase()}`}
            required={field.is_required}
          />
          {field.description && (
            <p className="text-sm text-gray-500">{field.description}</p>
          )}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div key={field.id} className="space-y-2">
          <label className="block text-[17px] font-medium text-[#1d1d1f]">
            {field.name} {field.is_required && '*'}
          </label>
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="sf-input w-full min-h-[120px]"
            placeholder={`Enter ${field.name.toLowerCase()}`}
            required={field.is_required}
          />
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
      );

    case 'select':
      return (
        <Select
          label={field.name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.is_required}
          error={error}
          helperText={field.description || undefined}
          options={getOptions()}
        />
      );

    case 'multiselect':
      return (
        <MultiSelect
          value={getFieldValue()}
          onChange={handleChange}
          options={getOptions()}
          error={error}
          label={getLabel()}
          required={field.is_required}
        />
      );

    case 'boolean':
      return (
        <Toggle
          label={field.name}
          checked={value === 'true'}
          onChange={(checked) => onChange(checked ? 'true' : 'false')}
          helperText={field.description || undefined}
        />
      );

    default:
      return null;
  }
};
