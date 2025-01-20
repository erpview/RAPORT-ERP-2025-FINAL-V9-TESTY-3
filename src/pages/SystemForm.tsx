import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SystemForm as SystemFormComponent } from '../components/SystemForm';
import { useSystemFields } from '../hooks/useSystemFields';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface SystemFormPageProps {
  mode: 'create' | 'edit';
  systemId?: string;
}

export const SystemForm: React.FC<SystemFormPageProps> = ({ mode, systemId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getModuleFields } = useSystemFields();
  const [isSaving, setIsSaving] = useState(false);
  const fields = getModuleFields().flatMap(module => module.fields);

  const handleSave = async (data: any) => {
    try {
      setIsSaving(true);

      // Insert the new system
      const { data: newSystem, error: systemError } = await supabase
        .from('systems')
        .insert([{
          name: data.name,
          vendor: data.vendor,
          website: data.website,
          description: data.description,
          status: 'draft'
        }])
        .select()
        .single();

      if (systemError) throw systemError;

      // Add the current user as an editor
      const { error: editorError } = await supabase
        .from('system_editors')
        .insert([{
          system_id: newSystem.id,
          editor_id: user?.id
        }]);

      if (editorError) throw editorError;

      // Insert field values
      const fieldValues = Object.entries(data.fields || {}).map(([field_id, value]) => ({
        system_id: newSystem.id,
        field_id,
        value: value as string
      }));

      if (fieldValues.length > 0) {
        const { error: valuesError } = await supabase
          .from('system_field_values')
          .insert(fieldValues);

        if (valuesError) throw valuesError;
      }

      toast.success('System został utworzony');
      navigate('/editor/systemy');
    } catch (error) {
      console.error('Error saving system:', error);
      toast.error('Nie udało się zapisać systemu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/editor/systemy');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">
          {mode === 'create' ? 'Dodaj nowy system' : 'Edytuj system'}
        </h1>
        <SystemFormComponent
          fields={fields}
          isCreating={mode === 'create'}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};
