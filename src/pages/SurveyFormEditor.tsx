import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Plus, ArrowLeft, Trash2, GripVertical, Pencil } from 'lucide-react';
import { SurveyForm, SurveyModule, SurveyField } from '../types/survey';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useState, useEffect } from 'react';

interface FieldType {
  value: SurveyField['field_type'];
  label: string;
}

const FIELD_TYPES: FieldType[] = [
  { value: 'text', label: 'Tekst' },
  { value: 'number', label: 'Liczba' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'date', label: 'Data' },
  { value: 'select', label: 'Lista wyboru' },
  { value: 'multiselect', label: 'Lista wielokrotnego wyboru' },
  { value: 'checkbox', label: 'Pola wyboru (2 kolumny)' },
  { value: 'textarea', label: 'Tekst wielolinijkowy' },
  { value: 'rating', label: 'Ocena (1-5 gwiazdek + N/A)' }
];

const SurveyFormEditor = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<SurveyForm | null>(null);
  const [modules, setModules] = useState<SurveyModule[]>([]);
  const [fields, setFields] = useState<Record<string, SurveyField[]>>({});
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');
  const [newOption, setNewOption] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleName, setEditingModuleName] = useState('');
  const [editingModuleDescription, setEditingModuleDescription] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    if (!isAdmin) {
      navigate('/admin/systemy');
      return;
    }
    if (formId) {
      loadForm();
    } else {
      setLoading(false);
    }
  }, [formId, user, isAdmin, navigate]);

  const loadForm = async () => {
    try {
      setLoading(true);
      
      // Load form
      const { data: formData, error: formError } = await supabase
        .from('survey_forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError) {
        console.error('Error loading form:', formError);
        toast.error('Błąd podczas ładowania formularza');
        return;
      }

      setForm(formData);

      // Load modules with order
      const { data: modulesData, error: modulesError } = await supabase
        .from('survey_modules')
        .select('*')
        .eq('form_id', formId)
        .order('order_index', { ascending: true });

      if (modulesError) {
        console.error('Error loading modules:', modulesError);
        toast.error('Błąd podczas ładowania modułów');
        return;
      }

      setModules(modulesData || []);

      // Load fields for each module with order
      const fieldsPromises = modulesData?.map(async (module) => {
        const { data: fieldsData, error: fieldsError } = await supabase
          .from('survey_fields')
          .select('*')
          .eq('module_id', module.id)
          .order('order_index', { ascending: true });

        if (fieldsError) {
          console.error('Error loading fields:', fieldsError);
          return [];
        }

        return fieldsData || [];
      });

      if (fieldsPromises) {
        const fieldsResults = await Promise.all(fieldsPromises);
        const fieldsMap: Record<string, any[]> = {};
        
        modulesData?.forEach((module, index) => {
          fieldsMap[module.id] = fieldsResults[index];
        });

        setFields(fieldsMap);
      }

    } catch (error) {
      console.error('Error loading form:', error);
      toast.error('Błąd podczas ładowania formularza');
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    if (!formId || !newModuleName.trim()) return;

    try {
      const { data: module, error } = await supabase
        .from('survey_modules')
        .insert({
          form_id: formId,
          name: newModuleName.trim(),
          description: newModuleDescription.trim() || null,
          order_index: modules.length
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding module:', error);
        toast.error('Błąd podczas dodawania modułu');
        return;
      }

      setModules([...modules, module]);
      setFields({ ...fields, [module.id]: [] });
      setShowAddModule(false);
      setNewModuleName('');
      setNewModuleDescription('');
      toast.success('Moduł został dodany');
    } catch (error) {
      console.error('Error adding module:', error);
      toast.error('Błąd podczas dodawania modułu');
    }
  };

  const handleAddField = async (moduleId: string) => {
    try {
      const moduleFields = fields[moduleId] || [];
      const newField = {
        module_id: moduleId,
        name: 'Nowe pole',
        label: 'Nowe pole',
        field_type: 'text' as const,
        field_key: '',
        description: null,
        order_index: moduleFields.length,
        options: null,
        is_required: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: field, error } = await supabase
        .from('survey_fields')
        .insert(newField)
        .select()
        .single();

      if (error) {
        console.error('Error adding field:', error);
        toast.error(`Błąd podczas dodawania pola: ${error.message}`);
        return;
      }

      setFields({
        ...fields,
        [moduleId]: [...moduleFields, field]
      });
      toast.success('Pole zostało dodane');
    } catch (error) {
      console.error('Error adding field:', error);
      toast.error('Błąd podczas dodawania pola');
    }
  };

  const handleUpdateField = async (moduleId: string, fieldId: string, updates: Partial<SurveyField>) => {
    try {
      // Remove fields that don't exist in the database
      const { field_key, ...validUpdates } = updates;

      // Add name as label if name is updated
      if (updates.name) {
        validUpdates.name = updates.name;
      }

      // Add updated_at timestamp
      validUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('survey_fields')
        .update(validUpdates)
        .eq('id', fieldId);

      if (error) {
        // If the error is about missing is_required column, show a message
        if (error.message?.includes("'is_required' column")) {
          toast.error('Funkcja "Wymagane pole" będzie dostępna po aktualizacji bazy danych');
          return;
        }

        console.error('Error updating field:', error);
        toast.error('Błąd podczas aktualizacji pola');
        return;
      }

      setFields({
        ...fields,
        [moduleId]: fields[moduleId].map(field =>
          field.id === fieldId ? { ...field, ...updates } : field
        )
      });
    } catch (error) {
      console.error('Error updating field:', error);
      toast.error('Błąd podczas aktualizacji pola');
    }
  };

  const handleAddOption = async (moduleId: string, fieldId: string) => {
    if (!newOption[fieldId]?.trim()) return;

    try {
      const currentField = fields[moduleId].find(f => f.id === fieldId);
      if (!currentField) return;
      
      const currentOptions = currentField.options || [];
      const updatedOptions = [...currentOptions, newOption[fieldId].trim()];
      
      const { error } = await supabase
        .from('survey_fields')
        .update({ 
          options: updatedOptions,
          updated_at: new Date().toISOString()
        })
        .eq('id', fieldId);

      if (error) {
        console.error('Error updating field options:', error);
        toast.error('Błąd podczas dodawania opcji');
        return;
      }

      setFields({
        ...fields,
        [moduleId]: fields[moduleId].map(field =>
          field.id === fieldId ? { ...field, options: updatedOptions } : field
        )
      });

      setNewOption({ ...newOption, [fieldId]: '' });
      toast.success('Opcja została dodana');
    } catch (error) {
      console.error('Error adding option:', error);
      toast.error('Błąd podczas dodawania opcji');
    }
  };

  const handleRemoveOption = async (moduleId: string, fieldId: string, optionIndex: number) => {
    try {
      const currentField = fields[moduleId].find(f => f.id === fieldId);
      if (!currentField) return;
      
      const currentOptions = currentField.options || [];
      const updatedOptions = currentOptions.filter((_, index) => index !== optionIndex);
      
      const { error } = await supabase
        .from('survey_fields')
        .update({ 
          options: updatedOptions,
          updated_at: new Date().toISOString()
        })
        .eq('id', fieldId);

      if (error) {
        console.error('Error removing option:', error);
        toast.error('Błąd podczas usuwania opcji');
        return;
      }

      setFields({
        ...fields,
        [moduleId]: fields[moduleId].map(field =>
          field.id === fieldId ? { ...field, options: updatedOptions } : field
        )
      });
      toast.success('Opcja została usunięta');
    } catch (error) {
      console.error('Error removing option:', error);
      toast.error('Błąd podczas usuwania opcji');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten moduł? Wszystkie pola w tym module zostaną również usunięte.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('survey_modules')
        .delete()
        .eq('id', moduleId);

      if (error) {
        console.error('Error deleting module:', error);
        toast.error('Błąd podczas usuwania modułu');
        return;
      }

      setModules(modules.filter(m => m.id !== moduleId));
      const newFields = { ...fields };
      delete newFields[moduleId];
      setFields(newFields);
      toast.success('Moduł został usunięty');
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Błąd podczas usuwania modułu');
    }
  };

  const handleDeleteField = async (moduleId: string, fieldId: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć to pole?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('survey_fields')
        .delete()
        .eq('id', fieldId);

      if (error) {
        console.error('Error deleting field:', error);
        toast.error('Błąd podczas usuwania pola');
        return;
      }

      setFields({
        ...fields,
        [moduleId]: fields[moduleId].filter(f => f.id !== fieldId)
      });
      toast.success('Pole zostało usunięte');
    } catch (error) {
      console.error('Error deleting field:', error);
      toast.error('Błąd podczas usuwania pola');
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) return;

    const sourceDroppableId = source.droppableId;
    const destDroppableId = destination.droppableId;

    // Reorder within the same module
    if (sourceDroppableId === destDroppableId) {
      const moduleFields = [...fields[sourceDroppableId]];
      const [removed] = moduleFields.splice(source.index, 1);
      moduleFields.splice(destination.index, 0, removed);

      // Update order_index for all fields in the module
      const updatedFields = moduleFields.map((field, index) => ({
        ...field,
        order_index: index
      }));

      setFields({
        ...fields,
        [sourceDroppableId]: updatedFields
      });

      // Update order_index in database
      updatedFields.forEach(field => {
        supabase
          .from('survey_fields')
          .update({ order_index: field.order_index })
          .eq('id', field.id)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating field order:', error);
              toast.error('Błąd podczas aktualizacji kolejności pól');
            }
          });
      });
    }
  };

  const handleEditModule = (module: SurveyModule) => {
    setEditingModuleId(module.id);
    setEditingModuleName(module.name);
    setEditingModuleDescription(module.description || '');
  };

  const handleUpdateModule = async () => {
    if (!editingModuleId || !editingModuleName.trim()) return;

    try {
      const { error } = await supabase
        .from('survey_modules')
        .update({
          name: editingModuleName.trim(),
          description: editingModuleDescription.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingModuleId);

      if (error) {
        console.error('Error updating module:', error);
        toast.error('Błąd podczas aktualizacji modułu');
        return;
      }

      setModules(modules.map(module =>
        module.id === editingModuleId
          ? {
              ...module,
              name: editingModuleName.trim(),
              description: editingModuleDescription.trim() || null
            }
          : module
      ));

      setEditingModuleId(null);
      setEditingModuleName('');
      setEditingModuleDescription('');
      toast.success('Moduł został zaktualizowany');
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Błąd podczas aktualizacji modułu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c3b67]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/admin/ankiety')}
              className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Powrót
            </Button>
            <h1 className="text-3xl font-bold">
              {form?.name || 'Edycja formularza'}
            </h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Modules */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Moduły</h2>
              <Button
                onClick={() => setShowAddModule(true)}
                className="sf-button bg-[#2c3b67] text-white hover:bg-[#2c3b67]/90"
              >
                <Plus className="w-5 h-5 mr-2" />
                Dodaj moduł
              </Button>
            </div>

            {modules.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Brak modułów. Kliknij "Dodaj moduł" aby utworzyć pierwszy.
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="modules" type="module">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-8"
                    >
                      {modules.map((module, moduleIndex) => (
                        <div key={module.id} className="bg-white rounded-lg shadow-sm border border-[#E8E8ED] p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              {editingModuleId === module.id ? (
                                <div className="space-y-4">
                                  <input
                                    type="text"
                                    value={editingModuleName}
                                    onChange={(e) => setEditingModuleName(e.target.value)}
                                    className="sf-input w-full"
                                    placeholder="Nazwa modułu"
                                  />
                                  <textarea
                                    value={editingModuleDescription}
                                    onChange={(e) => setEditingModuleDescription(e.target.value)}
                                    className="sf-input w-full"
                                    placeholder="Opis modułu (opcjonalnie)"
                                    rows={3}
                                  />
                                  <div className="flex gap-2">
                                    <Button onClick={handleUpdateModule}>
                                      Zapisz
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      onClick={() => {
                                        setEditingModuleId(null);
                                        setEditingModuleName('');
                                        setEditingModuleDescription('');
                                      }}
                                    >
                                      Anuluj
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <h3 className="text-[19px] font-semibold text-[#1d1d1f] flex items-center gap-2">
                                    <GripVertical className="w-5 h-5 text-[#86868b] cursor-move" />
                                    {module.name}
                                    <button
                                      onClick={() => handleEditModule(module)}
                                      className="p-1 hover:bg-[#F5F5F7] rounded-full transition-colors duration-200"
                                      title="Edytuj moduł"
                                    >
                                      <Pencil className="w-4 h-4 text-[#86868b]" />
                                    </button>
                                  </h3>
                                  {module.description && (
                                    <p className="text-[15px] text-[#424245] mt-1">
                                      {module.description}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => handleAddField(module.id)}
                                className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
                              >
                                <Plus className="w-5 h-5 mr-2" />
                                Dodaj pole
                              </Button>
                              <Button
                                onClick={() => handleDeleteModule(module.id)}
                                className="sf-button bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </div>

                          {/* Fields */}
                          {fields[module.id]?.length === 0 ? (
                            <div className="text-center py-6 text-gray-500">
                              Brak pól. Kliknij "Dodaj pole" aby utworzyć pierwsze.
                            </div>
                          ) : (
                            <Droppable droppableId={`${module.id}`} type="field">
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className="space-y-2"
                                >
                                  {fields[module.id]?.map((field, fieldIndex) => (
                                    <Draggable
                                      key={field.id}
                                      draggableId={field.id}
                                      index={fieldIndex}
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className="flex items-center gap-4 p-2 bg-gray-50 rounded"
                                        >
                                          <div {...provided.dragHandleProps}>
                                            <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                                          </div>
                                          <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-4">
                                              <input
                                                type="text"
                                                value={field.name}
                                                onChange={(e) => handleUpdateField(module.id, field.id, { 
                                                  name: e.target.value
                                                })}
                                                className="sf-input flex-1"
                                                placeholder="Nazwa pola"
                                              />
                                              <select
                                                value={field.field_type}
                                                onChange={(e) => {
                                                  const newType = e.target.value as SurveyField['field_type'];
                                                  handleUpdateField(module.id, field.id, {
                                                    field_type: newType,
                                                    options: ['select', 'multiselect', 'checkbox'].includes(newType) 
                                                      ? field.options || []
                                                      : null
                                                  });
                                                }}
                                                className="sf-input w-48"
                                              >
                                                {FIELD_TYPES.map(type => (
                                                  <option key={type.value} value={type.value}>
                                                    {type.label}
                                                  </option>
                                                ))}
                                              </select>
                                              <div className="flex items-center gap-2">
                                                <input
                                                  type="checkbox"
                                                  id={`required-${field.id}`}
                                                  checked={field.is_required}
                                                  onChange={(e) => handleUpdateField(module.id, field.id, { 
                                                    is_required: e.target.checked 
                                                  })}
                                                  className="sf-checkbox"
                                                  aria-label="Pole wymagane"
                                                />
                                                <label 
                                                  htmlFor={`required-${field.id}`}
                                                  className="text-sm text-gray-600"
                                                >
                                                  Wymagane
                                                </label>
                                              </div>
                                              <Button
                                                onClick={() => handleDeleteField(module.id, field.id)}
                                                className="sf-button bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90"
                                              >
                                                <Trash2 className="w-5 h-5" />
                                              </Button>
                                            </div>

                                            {/* Options for select, multiselect, and checkbox fields */}
                                            {['select', 'multiselect', 'checkbox'].includes(field.field_type) && (
                                              <div className="pl-4 border-l-2 border-gray-200">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                  Opcje
                                                </label>
                                                <div className="space-y-2">
                                                  {(field.options || []).map((option, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                      <span className="flex-1 px-2 py-1 bg-gray-50 rounded border border-gray-200">
                                                        {option}
                                                      </span>
                                                      <Button
                                                        onClick={() => handleRemoveOption(module.id, field.id, index)}
                                                        className="sf-button bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90 !p-1"
                                                      >
                                                        <Trash2 className="w-4 h-4" />
                                                      </Button>
                                                    </div>
                                                  ))}
                                                  
                                                  <div className="flex gap-2">
                                                    <input
                                                      type="text"
                                                      value={newOption[field.id] || ''}
                                                      onChange={(e) => setNewOption({
                                                        ...newOption,
                                                        [field.id]: e.target.value
                                                      })}
                                                      onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                          e.preventDefault();
                                                          handleAddOption(module.id, field.id);
                                                        }
                                                      }}
                                                      placeholder="Wpisz nową opcję"
                                                      className="sf-input flex-1"
                                                    />
                                                    <Button
                                                      onClick={() => handleAddOption(module.id, field.id)}
                                                      className="sf-button bg-[#007AFF] text-white hover:bg-[#007AFF]/90"
                                                    >
                                                      Dodaj
                                                    </Button>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          )}
                        </div>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>

        {/* Add Module Modal */}
        {showAddModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Dodaj nowy moduł</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nazwa modułu
                  </label>
                  <input
                    type="text"
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Wprowadź nazwę modułu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opis (opcjonalny)
                  </label>
                  <textarea
                    value={newModuleDescription}
                    onChange={(e) => setNewModuleDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Wprowadź opis modułu"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      setShowAddModule(false);
                      setNewModuleName('');
                      setNewModuleDescription('');
                    }}
                    className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
                  >
                    Anuluj
                  </Button>
                  <Button
                    onClick={handleAddModule}
                    disabled={!newModuleName.trim()}
                    className="sf-button bg-[#2c3b67] text-white hover:bg-[#2c3b67]/90"
                  >
                    Dodaj
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyFormEditor;
