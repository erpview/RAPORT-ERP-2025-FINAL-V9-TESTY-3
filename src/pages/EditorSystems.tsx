import React, { useState, useEffect } from 'react';
import { Plus, Loader2, AlertCircle, Settings2, FileEdit, Eye, MoreVertical, ChevronDown } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { System, SystemStatus } from '../types/system';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { SystemForm } from '../components/SystemForm';
import { useSystemFields } from '../hooks/useSystemFields';

export const EditorSystems: React.FC = () => {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SystemStatus | 'all'>('all');
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { fields } = useSystemFields();

  const loadSystems = async () => {
    try {
      setLoading(true);
      
      // Get systems where the current user is an editor
      const { data: editorData, error: editorError } = await supabase
        .from('system_editors')
        .select('system_id')
        .eq('editor_id', user?.id);

      if (editorError) throw editorError;

      const systemIds = editorData?.map(ed => ed.system_id) || [];

      if (systemIds.length === 0) {
        setSystems([]);
        return;
      }

      // Get the actual systems
      const { data: systemsData, error: systemsError } = await supabase
        .from('systems')
        .select('*')
        .in('id', systemIds)
        .order('updated_at', { ascending: false });

      if (systemsError) throw systemsError;
      setSystems(systemsData || []);
    } catch (error) {
      console.error('Error loading systems:', error);
      toast.error('Nie udało się załadować systemów');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystems();
  }, [user?.id]);

  const handleSave = async (data: { system: any, fieldValues: Record<string, string> }) => {
    try {
      setIsSaving(true);
      
      let systemId: string;
      
      if (isCreating) {
        // Insert new system
        const systemData = {
          ...data.system,
          created_by: user?.id,
          status: 'pending',
          size: Array.isArray(data.system.size) ? data.system.size : [data.system.size || 'Small']
        };

        const { data: newSystem, error: insertError } = await supabase
          .from('systems')
          .insert([systemData])
          .select()
          .single();

        if (insertError) throw insertError;
        if (!newSystem) throw new Error('Failed to create system');
        
        // Add the current user as an editor
        const { error: editorError } = await supabase
          .from('system_editors')
          .insert([{
            system_id: newSystem.id,
            editor_id: user?.id
          }]);

        if (editorError) throw editorError;
        
        systemId = newSystem.id;
        toast.success('System został dodany');
      } else if (selectedSystem) {
        // Update existing system
        const systemData = {
          ...data.system,
          status: 'pending',
          review_notes: data.system.review_notes,
          updated_at: new Date().toISOString(),
          size: Array.isArray(data.system.size) ? data.system.size : [data.system.size || selectedSystem.size[0]]
        };

        const { error: updateError } = await supabase
          .from('systems')
          .update(systemData)
          .eq('id', selectedSystem.id);

        if (updateError) throw updateError;
        
        systemId = selectedSystem.id;
        toast.success('System został zaktualizowany');
      }

      // Update field values
      if (systemId && data.fieldValues) {
        const fieldValueUpdates = Object.entries(data.fieldValues).map(([field_id, value]) => ({
          system_id: systemId,
          field_id,
          value: value as string
        }));

        if (fieldValueUpdates.length > 0) {
          // First delete existing values
          await supabase
            .from('system_field_values')
            .delete()
            .eq('system_id', systemId);

          // Then insert new values
          const { error: valuesError } = await supabase
            .from('system_field_values')
            .insert(fieldValueUpdates);

          if (valuesError) throw valuesError;
        }
      }

      handleCancel();
      loadSystems();
    } catch (error) {
      console.error('Error saving system:', error);
      toast.error('Nie udało się zapisać systemu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedSystem(null);
    setIsCreating(false);
  };

  const filteredSystems = statusFilter === 'all' 
    ? systems 
    : systems.filter(system => system.status === statusFilter);

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings2 className="w-8 h-8 text-[#2c3b67]" />
            <h1 className="text-[32px] font-semibold text-[#1d1d1f]">
              Zarządzanie systemami ERP
            </h1>
          </div>
          <button
            onClick={() => {
              setSelectedSystem(null);
              setIsCreating(true);
            }}
            className="sf-button-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Dodaj system
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <span className="text-[#86868b]">Filtruj według statusu:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SystemStatus | 'all')}
              className="sf-select"
            >
              <option value="all">Wszystkie</option>
              <option value="draft">Szkic</option>
              <option value="pending">Oczekujące</option>
              <option value="published">Opublikowane</option>
              <option value="rejected">Odrzucone</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
          ) : filteredSystems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nie znaleziono systemów</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredSystems.map(system => (
                <div
                  key={system.id}
                  className="sf-card p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{system.name}</h3>
                      <p className="text-sm text-gray-500">{system.vendor}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        system.status === 'published' ? 'bg-green-100 text-green-800' :
                        system.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        system.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {system.status === 'published' ? 'Opublikowany' :
                         system.status === 'pending' ? 'Oczekuje na zatwierdzenie' :
                         system.status === 'rejected' ? 'Odrzucony' :
                         'Szkic'}
                      </span>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="p-2 hover:bg-gray-100 rounded-full">
                            <MoreVertical className="w-5 h-5 text-gray-500" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content className="bg-white rounded-lg shadow-lg py-1 min-w-[160px]">
                            <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setSelectedSystem(system);
                                setIsCreating(false);
                              }}
                              disabled={system.status === 'pending'}
                            >
                              <FileEdit className="w-4 h-4 mr-2" />
                              {system.status === 'pending' ? 'Oczekuje na zatwierdzenie' : 'Edytuj'}
                            </DropdownMenu.Item>
                            <DropdownMenu.Item className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                              <Eye className="w-4 h-4 mr-2" />
                              Podgląd
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </div>
                  </div>
                  {system.status === 'rejected' && system.review_notes && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800">Uwagi od administratora:</h4>
                          <p className="text-sm text-red-700 mt-1">{system.review_notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {(isCreating || selectedSystem) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {isCreating ? 'Dodaj nowy system' : 'Edytuj system'}
              </h2>
              <SystemForm
                system={selectedSystem}
                fields={fields}
                onSave={handleSave}
                onCancel={handleCancel}
                isSaving={isSaving}
                isCreating={isCreating}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
