import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, AlertCircle, UserCog, UserPlus2, CheckCircle2, Layers } from 'lucide-react';
import { System } from '../types/system';
import { supabase } from '../config/supabase';
import { SystemStatusBadge } from '../components/SystemStatusBadge';
import { ReviewModal } from '../components/ReviewModal';
import { ReassignOwnerModal } from '../components/ReassignOwnerModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { SystemForm } from '../components/SystemForm';
import { useSystemFields } from '../hooks/useSystemFields';
import { useNavigate } from 'react-router-dom';

export const AdminSystems: React.FC = () => {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reviewSystem, setReviewSystem] = useState<System | null>(null);
  const [reassignSystem, setReassignSystem] = useState<System | null>(null);
  const { user, isAdmin, isEditor } = useAuth();
  const { fields } = useSystemFields();
  const navigate = useNavigate();

  const loadSystems = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('systems')
        .select('*');

      // If user is editor, only show their systems
      if (isEditor && user) {
        query = query.eq('created_by', user.id);
      }

      const { data, error } = await query
        .order('vendor', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setSystems(data || []);
    } catch (error) {
      console.error('Error loading systems:', error);
      toast.error('Nie udało się załadować systemów');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystems();
  }, [isEditor, user]);

  const handleSave = async (data: { system: any, fieldValues: Record<string, string> }) => {
    try {
      setIsSaving(true);
      
      let systemId: string;
      
      if (isCreating) {
        // Insert new system
        const systemData = {
          name: data.system.name,
          vendor: data.system.vendor,
          website: data.system.website || '',
          size: [data.system.size || 'Small'],
          description: data.system.description || 'Brak opisu',
          created_by: user?.id,
          status: isEditor ? 'pending' : 'published'
        };

        console.log('Creating new system with data:', systemData);

        const { data: newSystem, error: insertError } = await supabase
          .from('systems')
          .insert([systemData])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating system:', insertError);
          throw insertError;
        }
        if (!newSystem) throw new Error('Failed to create system');
        
        systemId = newSystem.id;

        // Save field values
        await saveFieldValues(systemId, data.fieldValues);
        
        toast.success('System został dodany');
        await loadSystems();
        setIsCreating(false);
      } else if (selectedSystem) {
        // Update existing system
        const systemData = {
          name: data.system.name,
          vendor: data.system.vendor,
          website: data.system.website || '',
          size: [data.system.size || selectedSystem.size[0]],
          description: data.system.description || selectedSystem.description || 'Brak opisu',
          status: isEditor ? 'pending' : 'published',
          reviewed_by: null,
          reviewed_at: null,
          review_notes: null
        };

        console.log('Updating system with data:', systemData);

        const { error: updateError } = await supabase
          .from('systems')
          .update(systemData)
          .eq('id', selectedSystem.id);

        if (updateError) {
          console.error('Error updating system:', updateError);
          throw updateError;
        }
        
        systemId = selectedSystem.id;

        // Save field values
        await saveFieldValues(systemId, data.fieldValues);
        
        toast.success('Zmiany zostały zapisane');
        await loadSystems();
        setSelectedSystem(null);
      }
    } catch (error) {
      console.error('Error saving system:', error);
      toast.error('Nie udało się zapisać zmian');
    } finally {
      setIsSaving(false);
    }
  };

  const saveFieldValues = async (systemId: string, fieldValues: Record<string, string>) => {
    try {
      // Delete existing values first
      await supabase
        .from('system_field_values')
        .delete()
        .eq('system_id', systemId);

      // Filter out empty values and prepare data
      const values = Object.entries(fieldValues)
        .filter(([_, value]) => value !== '')
        .map(([fieldId, value]) => ({
          system_id: systemId,
          field_id: fieldId,
          value: value
        }));

      // Insert new values if there are any
      if (values.length > 0) {
        const { error } = await supabase
          .from('system_field_values')
          .insert(values);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving field values:', error);
      throw new Error('Failed to save field values');
    }
  };

  const handleDelete = async (system: System) => {
    if (!confirm(`Czy na pewno chcesz usunąć system ${system.name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('systems')
        .delete()
        .eq('id', system.id);

      if (error) throw error;
      toast.success('System został usunięty');
      await loadSystems();
    } catch (error) {
      console.error('Error deleting system:', error);
      toast.error('Nie udało się usunąć systemu');
    }
  };

  const handleCancel = () => {
    setSelectedSystem(null);
    setIsCreating(false);
  };

  const canEditSystem = (system: System) => {
    if (isAdmin) return true;
    return user?.id === system.created_by && 
           (system.status === 'draft' || system.status === 'rejected' || system.status === 'published');
  };

  const canReviewSystem = (system: System) => {
    return isAdmin && system.status === 'pending';
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <UserCog className="w-8 h-8 text-[#2c3b67]" />
            <h1 className="text-[32px] font-semibold text-[#1d1d1f]">
              {isAdmin ? 'Zarządzanie systemami ERP' : 'Moje systemy ERP'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/modules')}
              className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
            >
              <Layers className="w-5 h-5 mr-2" />
              MODUŁY
            </button>
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
              {isAdmin ? 'Brak systemów w bazie danych' : 'Nie masz jeszcze dodanych systemów'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {systems.map((system) => (
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
                    {isAdmin && (
                      <button
                        onClick={() => setReassignSystem(system)}
                        className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
                      >
                        <UserPlus2 className="w-5 h-5 mr-2" />
                        Zmień właściciela
                      </button>
                    )}
                    {canEditSystem(system) && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedSystem(system);
                            setIsCreating(false);
                          }}
                          className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
                        >
                          <Pencil className="w-5 h-5 mr-2" />
                          Edytuj
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(system)}
                            className="sf-button bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90"
                          >
                            <Trash2 className="w-5 h-5 mr-2" />
                            Usuń
                          </button>
                        )}
                      </>
                    )}
                    {canReviewSystem(system) && (
                      <button
                        onClick={() => setReviewSystem(system)}
                        className="sf-button bg-[#34C759] text-white hover:bg-[#34C759]/90"
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Przejrzyj zmiany
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {(isCreating || selectedSystem) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

        {reviewSystem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <ReviewModal
              isOpen={true}
              onClose={() => setReviewSystem(null)}
              system={reviewSystem}
              onReviewComplete={loadSystems}
            />
          </div>
        )}

        {reassignSystem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <ReassignOwnerModal
              isOpen={true}
              onClose={() => setReassignSystem(null)}
              systemId={reassignSystem.id}
              currentOwner={reassignSystem.created_by}
              onSuccess={loadSystems}
            />
          </div>
        )}
      </div>
    </div>
  );
};