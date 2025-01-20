import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { CompanyModule, CompanyField } from '../hooks/useCompanyFields';

const FIELD_TYPES = [
  { value: 'text', label: 'Tekst' },
  { value: 'number', label: 'Liczba' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'date', label: 'Data' },
  { value: 'select', label: 'Lista wyboru' },
  { value: 'multiselect', label: 'Lista wielokrotnego wyboru' },
  { value: 'textarea', label: 'Tekst wielolinijkowy' }
];

const AdminCompanyFields: React.FC = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [fields, setFields] = useState<CompanyField[]>([]);
  const [module, setModule] = useState<CompanyModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingField, setEditingField] = useState<CompanyField | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    field_key: '',
    field_type: 'text',
    description: '',
    is_required: false,
    options: '',
    order_index: 0,
    is_active: true
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    if (moduleId) {
      fetchModule();
      fetchFields();
    }
  }, [moduleId, isAdmin, navigate]);

  const fetchModule = async () => {
    if (!moduleId) return;
    
    try {
      const { data, error } = await supabase
        .from('company_modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (error) throw error;
      setModule(data);
    } catch (error) {
      console.error('Error fetching module:', error);
    }
  };

  const fetchFields = async () => {
    if (!moduleId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_fields')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index');

      if (error) throw error;
      setFields(data || []);
    } catch (error) {
      console.error('Error fetching fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field: CompanyField) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      field_key: field.field_key,
      field_type: field.field_type,
      description: field.description || '',
      is_required: field.is_required,
      options: field.options ? JSON.stringify(field.options) : '',
      order_index: field.order_index,
      is_active: field.is_active
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId) return;

    try {
      const fieldData = {
        ...formData,
        module_id: moduleId,
        options: formData.options ? JSON.parse(formData.options) : null
      };

      if (editingField) {
        const { error } = await supabase
          .from('company_fields')
          .update(fieldData)
          .eq('id', editingField.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_fields')
          .insert([fieldData]);

        if (error) throw error;
      }

      setIsFormOpen(false);
      setEditingField(null);
      setFormData({
        name: '',
        field_key: '',
        field_type: 'text',
        description: '',
        is_required: false,
        options: '',
        order_index: 0,
        is_active: true
      });
      fetchFields();
    } catch (error) {
      console.error('Error saving field:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Pola modułu: {module?.name}
          </h1>
          {module?.description && (
            <p className="text-gray-600 mt-1">{module.description}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/admin/company-modules')} variant="secondary">
            Powrót
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            Dodaj nowe pole
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingField ? 'Edytuj pole' : 'Dodaj nowe pole'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nazwa
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Klucz pola
                </label>
                <input
                  type="text"
                  value={formData.field_key}
                  onChange={(e) => setFormData({ ...formData, field_key: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Typ pola
                </label>
                <select
                  value={formData.field_type}
                  onChange={(e) => setFormData({ ...formData, field_type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Opis
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {(formData.field_type === 'select' || formData.field_type === 'multiselect') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Opcje (JSON)
                  </label>
                  <textarea
                    value={formData.options}
                    onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder='["opcja1", "opcja2", "opcja3"]'
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kolejność
                </label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_required}
                    onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Wymagane
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Aktywne
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingField(null);
                  }}
                  variant="secondary"
                >
                  Anuluj
                </Button>
                <Button type="submit">
                  {editingField ? 'Zapisz zmiany' : 'Dodaj pole'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {fields.map((field) => (
            <li key={field.id}>
              <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {field.name}
                    {field.is_required && (
                      <span className="ml-2 text-red-500 text-sm">*</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Klucz: {field.field_key} | Typ: {field.field_type}
                  </p>
                  {field.description && (
                    <p className="mt-1 text-sm text-gray-500">{field.description}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Kolejność: {field.order_index} | Status:{' '}
                    {field.is_active ? 'Aktywne' : 'Nieaktywne'}
                  </p>
                </div>
                <Button onClick={() => handleEdit(field)} variant="secondary">
                  Edytuj
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminCompanyFields;
