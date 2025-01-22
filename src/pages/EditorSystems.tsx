import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Loader2, AlertCircle, Settings2, FileEdit, Eye, MoreVertical, ChevronDown, X } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { System, SystemStatus } from '../types/system';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { SystemForm } from '../components/SystemForm';
import { useSystemFields } from '../hooks/useSystemFields';
import { SystemStatusBadge } from '../components/SystemStatusBadge';

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
              Moje systemy ERP
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
            Dodaj nowy system
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-[#86868b]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-[17px]">Ładowanie systemów...</p>
            </div>
          </div>
        ) : systems.length === 0 ? (
          <div className="sf-card p-8 text-center">
            <AlertCircle className="w-8 h-8 text-[#86868b] mx-auto mb-4" />
            <p className="text-[17px] text-[#86868b]">
              Nie masz jeszcze przypisanych systemów
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSystems.map((system) => (
              <div
                key={system.id}
                className="sf-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[19px] font-semibold text-[#1d1d1f]">
                      {system.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-[15px] text-[#86868b]">
                        {system.vendor}
                      </p>
                      <SystemStatusBadge status={system.status} />
                    </div>
                    {system.review_notes && (
                      <div className="mt-3 p-3 bg-[#F5F5F7] rounded-xl">
                        <p className="text-[15px] text-[#1d1d1f]">
                          <span className="font-medium">Uwagi od administratora:</span><br/>
                          {system.review_notes}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedSystem(system);
                        setIsCreating(false);
                      }}
                      disabled={system.status === 'pending'}
                      className={`sf-button ${
                        system.status === 'pending' 
                          ? 'bg-[#F5F5F7] text-[#86868b] cursor-not-allowed opacity-50' 
                          : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]'
                      }`}
                    >
                      <Pencil className="w-5 h-5 mr-2" />
                      {system.status === 'pending' ? 'Oczekuje na zatwierdzenie' : 'Edytuj'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(isCreating || selectedSystem) && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[24px] font-semibold text-[#1d1d1f]">
                  {isCreating ? 'Dodaj nowy system' : 'Edytuj system'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SystemForm
                system={selectedSystem}
                onSave={handleSave}
                onCancel={handleCancel}
                isSaving={isSaving}
                fields={fields}
                mode="editor"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
