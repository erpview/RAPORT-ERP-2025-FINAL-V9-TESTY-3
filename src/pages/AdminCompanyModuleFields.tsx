import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Loader2, Settings, GripVertical, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FieldForm } from '../components/FieldForm';

interface CompanyField {
  id: string;
  module_id: string;
  name: string;
  field_key: string;
  field_type: string;
  description: string | null;
  is_required: boolean;
  options: any;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CompanyModule {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminCompanyModuleFields: React.FC = () => {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const { isAdmin } = useAuth();
  const [module, setModule] = useState<CompanyModule | null>(null);
  const [fields, setFields] = useState<CompanyField[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingField, setEditingField] = useState<CompanyField | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    if (!moduleId) {
      navigate('/admin/company-modules');
      return;
    }
    fetchModuleAndFields();
  }, [isAdmin, moduleId, navigate]);

  const fetchModuleAndFields = async () => {
    try {
      setLoading(true);

      // Fetch module
      const { data: moduleData, error: moduleError } = await supabase
        .from('company_modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (moduleError) throw moduleError;
      setModule(moduleData);

      // Fetch fields
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('company_fields')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index');

      if (fieldsError) throw fieldsError;
      setFields(fieldsData || []);
    } catch (error) {
      console.error('Error fetching module and fields:', error);
      toast.error('Nie udało się załadować pól');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order_index for affected items
    const updates = items.map((item, index) => ({
      id: item.id,
      order_index: index + 1
    }));

    setFields(items);

    try {
      for (const update of updates) {
        const { error } = await supabase
          .from('company_fields')
          .update({ order_index: update.order_index })
          .eq('id', update.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating field order:', error);
      toast.error('Nie udało się zaktualizować kolejności pól');
      fetchModuleAndFields(); // Refresh the list
    }
  };

  const handleDelete = async (fieldId: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć to pole?')) return;

    try {
      const { error } = await supabase
        .from('company_fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;
      
      toast.success('Pole zostało usunięte');
      fetchModuleAndFields();
    } catch (error) {
      console.error('Error deleting field:', error);
      toast.error('Nie udało się usunąć pola');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-[#2c3b67]" />
            <h1 className="text-[32px] font-semibold text-[#1d1d1f]">
              {module?.name} - Pola dodatkowe
            </h1>
          </div>
          <button
            onClick={() => {
              setEditingField(null);
              setIsFormOpen(true);
            }}
            className="sf-button-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Dodaj pole
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-[#86868b]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-[17px]">Ładowanie pól...</p>
            </div>
          </div>
        ) : fields.length === 0 ? (
          <div className="sf-card p-8 text-center">
            <p className="text-[17px] text-[#86868b]">
              Ten moduł nie ma jeszcze żadnych pól.
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-1 gap-4"
                >
                  {fields.map((field, index) => (
                    <Draggable
                      key={field.id}
                      draggableId={field.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="sf-card p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-4">
                              <div
                                {...provided.dragHandleProps}
                                className="mt-1 cursor-move"
                              >
                                <GripVertical className="w-5 h-5 text-[#86868b]" />
                              </div>
                              <div>
                                <h3 className="text-[19px] font-semibold text-[#1d1d1f]">
                                  {field.name}
                                </h3>
                                <div className="flex items-center gap-3 mt-2">
                                  <p className="text-[15px] text-[#86868b]">
                                    {field.field_key}
                                  </p>
                                  <span className="text-[15px] text-[#86868b]">•</span>
                                  <p className="text-[15px] text-[#86868b]">
                                    {field.field_type}
                                  </p>
                                  {field.is_required && (
                                    <>
                                      <span className="text-[15px] text-[#86868b]">•</span>
                                      <p className="text-[15px] text-[#FF3B30]">
                                        Wymagane
                                      </p>
                                    </>
                                  )}
                                </div>
                                {field.description && (
                                  <p className="mt-2 text-[15px] text-[#86868b]">
                                    {field.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingField(field);
                                  setIsFormOpen(true);
                                }}
                                className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
                              >
                                <Pencil className="w-5 h-5 mr-2" />
                                Edytuj
                              </button>
                              <button
                                onClick={() => handleDelete(field.id)}
                                className="sf-button bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90"
                              >
                                <Trash2 className="w-5 h-5 mr-2" />
                                Usuń
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {isFormOpen && moduleId && (
          <FieldForm
            isOpen={isFormOpen}
            moduleId={moduleId}
            field={editingField}
            onClose={() => {
              setIsFormOpen(false);
              setEditingField(null);
            }}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingField(null);
              fetchModuleAndFields();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCompanyModuleFields;
