import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from '../config/supabase';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { IconButton } from '../components/ui/IconButton';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FieldForm } from '../components/FieldForm';
import toast from 'react-hot-toast';

type Field = {
  id: string;
  name: string;
  field_key: string;
  field_type: string;
  description: string | null;
  is_required: boolean;
  options: string[] | null;
  order_index: number;
  is_active: boolean;
};

type Module = {
  id: string;
  name: string;
  description: string | null;
};

export const AdminModuleFields: React.FC = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [module, setModule] = useState<Module | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);

  useEffect(() => {
    if (moduleId) {
      fetchModule();
      fetchFields();
    }
  }, [moduleId]);

  const fetchModule = async () => {
    if (!moduleId) return;
    
    try {
      const { data, error } = await supabase
        .from('system_modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (error) throw error;
      setModule(data);
    } catch (err) {
      console.error('Error fetching module:', err);
      toast.error('Failed to load module');
    }
  };

  const fetchFields = async () => {
    if (!moduleId) return;
    
    try {
      const { data, error } = await supabase
        .from('system_fields')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index');

      if (error) throw error;
      setFields(data || []);
    } catch (err) {
      console.error('Error fetching fields:', err);
      toast.error('Failed to load fields');
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
      name: item.name,
      field_key: item.field_key,
      field_type: item.field_type,
      is_required: item.is_required,
      order_index: index + 1,
      is_active: item.is_active
    }));

    setFields(items);

    try {
      const { error } = await supabase
        .from('system_fields')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;
      toast.success('Field order updated');
    } catch (err) {
      console.error('Error updating field order:', err);
      toast.error('Failed to update field order');
    }
  };

  const handleDelete = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field?')) return;

    try {
      const { error } = await supabase
        .from('system_fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;
      
      toast.success('Field deleted successfully');
      await fetchFields();
    } catch (err) {
      console.error('Error deleting field:', err);
      toast.error('Failed to delete field');
    }
  };

  const handleEdit = (field: Field) => {
    // Only name and vendor are core fields now
    const coreFields = ['name', 'vendor'];
    if (coreFields.includes(field.field_key)) {
      toast.error('Core fields cannot be edited');
      return;
    }
    setEditingField(field);
    setIsFormOpen(true);
  };

  const translateFieldName = (field: Field): string => {
    // Core field translations
    const translations: { [key: string]: string } = {
      'name': 'Nazwa systemu',
      'vendor': 'Dostawca',
      'website': 'Strona WWW',
      'company_size': 'Wielkość firmy',
      'description': 'Opis'
    };

    // If it's a core field, use translation, otherwise use the field's name
    return translations[field.field_key] || field.name;
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingField(null);
  };

  const handleFormSuccess = () => {
    fetchFields();
  };

  if (!module) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{module.name}</h1>
          <p className="text-gray-600">{module.description}</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Dodaj Pole
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="fields">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {fields.map((field, index) => {
                const isCore = ['name', 'vendor'].includes(field.field_key);
                return (
                  <Draggable 
                    key={field.id} 
                    draggableId={field.id} 
                    index={index}
                    isDragDisabled={isCore}
                  >
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`mb-4 ${isCore ? 'bg-gray-50' : ''}`}
                      >
                        <div className="flex justify-between items-center p-4">
                          <div>
                            <h3 className="font-medium">{translateFieldName(field)}</h3>
                            <p className="text-sm text-gray-500">
                              {field.field_type}
                              {field.is_required && ' (wymagane)'}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            {!isCore && (
                              <>
                                <IconButton
                                  onClick={() => handleEdit(field)}
                                  icon={<PencilIcon className="h-4 w-4" />}
                                />
                                <IconButton
                                  onClick={() => handleDelete(field.id)}
                                  icon={<TrashIcon className="h-4 w-4" />}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {moduleId && (
        <FieldForm
          isOpen={isFormOpen}
          moduleId={moduleId}
          field={editingField}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};
