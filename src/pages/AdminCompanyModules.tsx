import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Loader2, Settings, GripVertical, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CompanyModule } from '../hooks/useCompanyFields';

interface ExtendedCompanyModule extends CompanyModule {
  field_count: number;
}

const AdminCompanyModules: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [modules, setModules] = useState<ExtendedCompanyModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ExtendedCompanyModule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order_index: 0,
    is_active: true
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchModules();
  }, [isAdmin, navigate]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_modules')
        .select(`
          *,
          company_fields (count)
        `)
        .order('order_index');

      if (error) throw error;

      const transformedData = (data || []).map(module => ({
        ...module,
        field_count: module.company_fields?.[0]?.count || 0
      }));

      setModules(transformedData);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Nie udało się załadować modułów');
    } finally {
      setLoading(false);
    }
  };

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
        .from('company_modules')
        .upsert(updates);

      if (error) throw error;
      toast.success('Kolejność została zaktualizowana');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Nie udało się zaktualizować kolejności');
      await fetchModules();
    }
  };

  const handleEdit = (module: ExtendedCompanyModule) => {
    setEditingModule(module);
    setFormData({
      name: module.name,
      description: module.description || '',
      order_index: module.order_index,
      is_active: module.is_active
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingModule) {
        const { error } = await supabase
          .from('company_modules')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingModule.id);

        if (error) throw error;
        toast.success('Moduł został zaktualizowany');
      } else {
        const { error } = await supabase
          .from('company_modules')
          .insert([{
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
        toast.success('Moduł został dodany');
      }

      setIsFormOpen(false);
      setEditingModule(null);
      setFormData({
        name: '',
        description: '',
        order_index: 0,
        is_active: true
      });
      fetchModules();
    } catch (error) {
      console.error('Error saving module:', error);
      toast.error('Nie udało się zapisać modułu');
    }
  };

  const toggleModuleStatus = async (moduleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('company_modules')
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', moduleId);

      if (error) throw error;
      await fetchModules();
      toast.success('Status modułu został zaktualizowany');
    } catch (error) {
      console.error('Error toggling module status:', error);
      toast.error('Nie udało się zaktualizować statusu modułu');
    }
  };

  const deleteModule = async (moduleId: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten moduł? Spowoduje to również usunięcie wszystkich powiązanych pól.')) {
      return;
    }

    try {
      // First delete all fields associated with this module
      const { error: fieldsError } = await supabase
        .from('company_fields')
        .delete()
        .eq('module_id', moduleId);

      if (fieldsError) throw fieldsError;

      // Then delete the module itself
      const { error: moduleError } = await supabase
        .from('company_modules')
        .delete()
        .eq('id', moduleId);

      if (moduleError) throw moduleError;

      toast.success('Moduł został usunięty');
      fetchModules();
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Nie udało się usunąć modułu');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-[#2c3b67]" />
            <h1 className="text-[32px] font-semibold text-[#1d1d1f]">
              MODUŁY FIRMY
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
                                  <button
                                    onClick={() => navigate(`/admin/company-modules/${module.id}/fields`)}
                                    className="sf-button-secondary"
                                  >
                                    Zarządzaj polami
                                  </button>
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
                                    onClick={() => deleteModule(module.id)}
                                    className="sf-button-danger"
                                    title="Usuń moduł"
                                  >
                                    <Trash2 className="w-4 h-4" />
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">
                {editingModule ? 'Edytuj moduł' : 'Dodaj nowy moduł'}
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
                    Opis
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
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
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Aktywny
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingModule(null);
                    }}
                    className="sf-button-secondary"
                  >
                    Anuluj
                  </button>
                  <button type="submit" className="sf-button-primary">
                    {editingModule ? 'Zapisz zmiany' : 'Dodaj moduł'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCompanyModules;
