import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { MultiSelect } from './ui/MultiSelect';
import { TextArea } from './ui/TextArea';
import { Toggle } from './ui/Toggle';
import { Modal } from './ui/Modal';
import toast from 'react-hot-toast';
import { Type, Key, FileText, ToggleLeft, List } from 'lucide-react';

interface FieldFormProps {
  isOpen: boolean;
  moduleId: string;
  field?: {
    id: string;
    name: string;
    field_key: string;
    field_type: string;
    description: string | null;
    is_required: boolean;
    options: string[] | null;
    order_index: number;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'multiselect', label: 'Multi Select' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'url', label: 'URL' },
  { value: 'email', label: 'Email' },
];

export const FieldForm: React.FC<FieldFormProps> = ({ 
  isOpen, 
  moduleId, 
  field, 
  onClose,
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    field_key: '',
    field_type: 'text',
    description: '',
    is_required: false,
    options: '',
  });

  useEffect(() => {
    if (field) {
      setFormData({
        name: field.name,
        field_key: field.field_key,
        field_type: field.field_type,
        description: field.description || '',
        is_required: field.is_required,
        options: field.options ? field.options.join('\n') : '',
      });
    } else {
      // Reset form when adding new field
      setFormData({
        name: '',
        field_key: '',
        field_type: 'text',
        description: '',
        is_required: false,
        options: '',
      });
    }
  }, [field, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const fieldData = {
        module_id: moduleId,
        name: formData.name.trim(),
        field_key: formData.field_key.toLowerCase().replace(/\s+/g, '_'),
        field_type: formData.field_type,
        description: formData.description?.trim() || null,
        is_required: formData.is_required,
        options: formData.options
          ? formData.options.split('\n').map((o) => o.trim()).filter(Boolean)
          : null,
        order_index: field?.order_index || 999,
        is_active: true,
      };

      // Check if field_key already exists for this module
      const { data: existingField, error: checkError } = await supabase
        .from('company_fields')
        .select('id')
        .eq('module_id', moduleId)
        .eq('field_key', fieldData.field_key)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingField && (!field || existingField.id !== field.id)) {
        throw new Error('A field with this key already exists in this module');
      }

      const { error: submitError } = field
        ? await supabase
            .from('company_fields')
            .update(fieldData)
            .eq('id', field.id)
        : await supabase
            .from('company_fields')
            .insert([fieldData]);

      if (submitError) {
        if (submitError.code === '23505') {
          throw new Error('A field with this key already exists in this module');
        }
        throw submitError;
      }

      toast.success(field ? 'Field updated successfully' : 'Field created successfully');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving field:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save field');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-[21px] font-semibold text-[#1d1d1f]">
              {field ? 'Edytuj Pole' : 'Dodaj Nowe Pole'}
            </h3>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                  Nazwa Pola *
                </label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="sf-input pl-10 w-full h-12 border border-[#d2d2d7] rounded-lg focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors"
                    placeholder="Wprowadź nazwę pola"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                  Klucz Pola *
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5" />
                  <input
                    type="text"
                    value={formData.field_key}
                    onChange={(e) => setFormData({ ...formData, field_key: e.target.value })}
                    className="sf-input pl-10 w-full h-12 border border-[#d2d2d7] rounded-lg focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors"
                    placeholder="Wprowadź klucz pola"
                    required
                  />
                </div>
                <p className="text-sm text-[#86868b] mt-1">Unikalny identyfikator pola (formatowany automatycznie)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                  Typ Pola *
                </label>
                <div className="relative">
                  <List className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#86868b] w-5 h-5 z-10" />
                  <select
                    value={formData.field_type}
                    onChange={(e) => setFormData({ ...formData, field_type: e.target.value })}
                    className="sf-input pl-10 w-full h-12 border border-[#d2d2d7] rounded-lg focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors appearance-none !bg-[#F5F5F7] hover:!bg-[#E8E8ED] cursor-pointer text-[15px] font-medium"
                    required
                  >
                    {FIELD_TYPES.map(type => (
                      <option 
                        key={type.value} 
                        value={type.value}
                        className="bg-white hover:bg-[#F5F5F7] py-2"
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-[#86868b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mt-8">
                  <Toggle
                    label="Pole wymagane"
                    checked={formData.is_required}
                    onChange={(checked) => setFormData({ ...formData, is_required: checked })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                Opis
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-[#86868b] w-5 h-5" />
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="sf-input pl-10 w-full min-h-[100px] border border-[#d2d2d7] rounded-lg focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors"
                  placeholder="Wprowadź opis pola"
                />
              </div>
            </div>

            {(formData.field_type === 'select' || formData.field_type === 'multiselect') && (
              <div>
                <label className="block text-[17px] font-medium text-[#1d1d1f] mb-2">
                  Opcje *
                </label>
                <div className="relative">
                  <List className="absolute left-3 top-3 text-[#86868b] w-5 h-5" />
                  <textarea
                    value={formData.options}
                    onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                    className="sf-input pl-10 w-full min-h-[150px] border border-[#d2d2d7] rounded-lg focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-colors"
                    placeholder="Wprowadź opcje, jedna w linii
Przykład:
Mały (1-50)
Średni (51-200)
Duży (201-500)
Enterprise (500+)"
                    required
                  />
                </div>
                <p className="text-sm text-[#86868b] mt-1">Jedna opcja w linii. Każda linia będzie osobną opcją do wyboru.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              variant="secondary"
              onClick={onClose}
              className="px-6 py-2 text-[#1d1d1f] border border-[#d2d2d7] hover:bg-gray-50"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-6 py-2 bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors"
            >
              {field ? 'Zapisz Zmiany' : 'Dodaj Pole'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
