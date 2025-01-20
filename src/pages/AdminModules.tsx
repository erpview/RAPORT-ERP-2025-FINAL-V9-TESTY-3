import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Settings, GripVertical } from 'lucide-react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Link } from 'react-router-dom';
import { ModuleForm } from '../components/ModuleForm';

interface Module {
  id: string;
  name: string;
  description: string;
  field_count: number;
  is_active: boolean;
  is_public: boolean;
}

export const AdminModules: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | undefined>(undefined);

  const loadModules = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('system_modules')
        .select(`
          *,
          system_fields (count)
        `)
        .order('order_index', { ascending: true });

      if (error) throw error;

      const transformedData = data.map(module => ({
        ...module,
        field_count: module.system_fields?.[0]?.count || 0
      }));
      
      setModules(transformedData);
    } catch (error) {
      console.error('Error loading modules:', error);
      toast.error('Nie udało się załadować modułów');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(modules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order_index: index + 1
    }));

    setModules(updatedItems);

    try {
      const updates = updatedItems.map(({ id, order_index, name }) => ({
        id,
        order_index,
        name
      }));

      const { error } = await supabase
        .from('system_modules')
        .upsert(updates);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Nie udało się zaktualizować kolejności');
      await loadModules();
    }
  };

  const toggleModuleStatus = async (moduleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('system_modules')
        .update({ is_active: !currentStatus })
        .eq('id', moduleId);

      if (error) throw error;

      await loadModules();
      toast.success('Status modułu został zaktualizowany');
    } catch (error) {
      console.error('Error toggling module status:', error);
      toast.error('Nie udało się zaktualizować statusu modułu');
    }
  };

  const handleEdit = (module: Module) => {
    setEditingModule(module);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingModule(undefined);
  };

  const toggleModuleVisibility = async (module: Module) => {
    try {
      const { error } = await supabase
        .from('system_modules')
        .update({
          is_public: !module.is_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', module.id);

      if (error) throw error;

      // Update local state
      setModules(modules.map(m => 
        m.id === module.id ? { ...m, is_public: !m.is_public } : m
      ));

      toast.success(`Moduł jest teraz ${!module.is_public ? 'publiczny' : 'prywatny'}`);
    } catch (error) {
      console.error('Error toggling module visibility:', error);
      toast.error('Nie udało się zmienić widoczności modułu');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-[#2c3b67]" />
            <h1 className="text-[32px] font-semibold text-[#1d1d1f]">
              MODUŁY
            </h1>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="sf-button-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Dodaj moduł
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-[#86868b]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-[17px]">Ładowanie modułów...</p>
            </div>
          </div>
        ) : modules.length === 0 ? (
          <div className="sf-card p-8 text-center">
            <p className="text-[17px] text-[#86868b]">
              Brak zdefiniowanych modułów
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="modules">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-1 gap-4"
                >
                  {modules.map((module, index) => (
                    <Draggable
                      key={module.id}
                      draggableId={module.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="sf-card p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-4">
                            <div
                              {...provided.dragHandleProps}
                              className="mt-1.5 text-[#86868b] hover:text-[#2c3b67] transition-colors cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="w-5 h-5" />
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="font-semibold">{module.name}</h3>
                                  <p className="text-sm text-gray-600">{module.description}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEdit(module)}
                                    className="sf-button-secondary"
                                  >
                                    Edytuj
                                  </button>
                                  <Link
                                    to={`/admin/modules/${module.id}/fields`}
                                    className="sf-button-secondary"
                                  >
                                    Pola
                                  </Link>
                                  <button
                                    onClick={() => toggleModuleStatus(module.id, module.is_active)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                      module.is_active
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                    }`}
                                  >
                                    {module.is_active ? 'Aktywny' : 'Nieaktywny'}
                                  </button>
                                  <button
                                    onClick={() => toggleModuleVisibility(module)}
                                    className={`px-2 py-1 rounded text-sm ${
                                      module.is_public
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                    title={module.is_public ? 'Widoczny publicznie' : 'Widoczny tylko dla zalogowanych'}
                                  >
                                    {module.is_public ? 'Publiczny' : 'Prywatny'}
                                  </button>
                                </div>
                              </div>
                              <div className="mt-2">
                                <span className="px-2 py-1 text-sm font-medium bg-[#F5F5F7] rounded-md">
                                  {module.field_count} {module.field_count === 1 ? 'pole' : 'pól'}
                                </span>
                              </div>
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

        {isFormOpen && (
          <ModuleForm
            module={editingModule}
            onClose={handleCloseForm}
            onModuleCreated={loadModules}
          />
        )}
      </div>
    </div>
  );
};
