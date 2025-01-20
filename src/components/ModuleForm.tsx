import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

interface ModuleFormProps {
  module?: {
    id: string;
    name: string;
    description: string;
    is_public: boolean;
  };
  onClose: () => void;
  onModuleCreated: () => void;
}

export const ModuleForm: React.FC<ModuleFormProps> = ({
  module,
  onClose,
  onModuleCreated
}) => {
  const [formData, setFormData] = useState({
    name: module?.name || '',
    description: module?.description || '',
    is_public: module?.is_public ?? false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (module) {
        // Update existing module
        const { error } = await supabase
          .from('system_modules')
          .update({
            name: formData.name,
            description: formData.description,
            is_public: formData.is_public,
            updated_at: new Date().toISOString()
          })
          .eq('id', module.id);

        if (error) throw error;
        toast.success('Moduł został zaktualizowany');
      } else {
        // Create new module
        const { error } = await supabase
          .from('system_modules')
          .insert({
            name: formData.name,
            description: formData.description,
            is_public: formData.is_public,
            order_index: 999 // Will be reordered after creation
          });

        if (error) throw error;
        toast.success('Moduł został utworzony');
      }

      onModuleCreated();
      onClose();
    } catch (error) {
      console.error('Error saving module:', error);
      toast.error(module ? 'Nie udało się zaktualizować modułu' : 'Nie udało się utworzyć modułu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-[#d2d2d7]">
          <h2 className="text-[19px] font-semibold text-[#1d1d1f]">
            {module ? 'Edytuj moduł' : 'Dodaj nowy moduł'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#86868b] hover:text-[#1d1d1f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#1d1d1f] mb-1"
            >
              Nazwa modułu
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-[#d2d2d7] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-[#1d1d1f] mb-1"
            >
              Opis modułu
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-[#d2d2d7] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_public"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="is_public"
              className="text-sm font-medium text-[#1d1d1f]"
            >
              Widoczny dla niezalogowanych użytkowników
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="sf-button-secondary"
              disabled={isSubmitting}
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="sf-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Zapisywanie...' : module ? 'Zapisz zmiany' : 'Dodaj moduł'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
