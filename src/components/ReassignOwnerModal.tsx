import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../config/supabase';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface Editor {
  user_id: string;
  email: string;
}

interface ReassignOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemId: string;
  currentOwner: string;
  onSuccess: () => void;
}

export const ReassignOwnerModal: React.FC<ReassignOwnerModalProps> = ({
  isOpen,
  onClose,
  systemId,
  currentOwner,
  onSuccess
}) => {
  const [editors, setEditors] = useState<Editor[]>([]);
  const [selectedEditor, setSelectedEditor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEditors = async () => {
      try {
        const { data, error } = await supabase
          .from('user_management')
          .select('user_id, email')
          .eq('role', 'editor')
          .eq('is_active', true)
          .neq('user_id', currentOwner);

        if (error) throw error;
        setEditors(data || []);
      } catch (error) {
        console.error('Error fetching editors:', error);
        toast.error('Nie udało się pobrać listy edytorów');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchEditors();
    }
  }, [isOpen, currentOwner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditor) return;

    setIsSubmitting(true);
    try {
      // Start a transaction
      const { error: systemError } = await supabase
        .from('systems')
        .update({ created_by: selectedEditor })
        .eq('id', systemId);

      if (systemError) throw systemError;

      // First check if an entry already exists
      const { data: existingEntry } = await supabase
        .from('system_editors')
        .select('*')
        .eq('system_id', systemId)
        .eq('editor_id', selectedEditor)
        .single();

      if (!existingEntry) {
        // Add entry to system_editors table only if it doesn't exist
        const { error: editorError } = await supabase
          .from('system_editors')
          .insert([{
            system_id: systemId,
            editor_id: selectedEditor,
            assigned_by: user?.id,  // Current admin who's making the change
            assigned_at: new Date().toISOString()
          }]);

        if (editorError) throw editorError;
      }

      toast.success('Właściciel systemu został zmieniony');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error reassigning owner:', error);
      toast.error('Nie udało się zmienić właściciela systemu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[24px] font-semibold text-[#1d1d1f]">
              Zmień właściciela systemu
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#2c3b67]" />
            </div>
          ) : editors.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-[#FF3B30] mx-auto mb-4" />
              <p className="text-[15px] text-[#1d1d1f]">
                Brak dostępnych edytorów do przypisania
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nowy właściciel *
                </label>
                <Select
                  options={editors.map(editor => ({
                    value: editor.user_id,
                    label: editor.email
                  }))}
                  onChange={(selected) => setSelectedEditor(selected?.value || null)}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Wybierz edytora"
                  noOptionsMessage={() => "Brak opcji"}
                  isSearchable={false}
                  required
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '42px',
                      borderColor: '#d2d2d7',
                      '&:hover': {
                        borderColor: '#2c3b67'
                      }
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#2c3b67' : state.isFocused ? '#F5F5F7' : 'white',
                      color: state.isSelected ? 'white' : '#1d1d1f',
                      cursor: 'pointer',
                      '&:active': {
                        backgroundColor: '#2c3b67'
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: '14px',
                      overflow: 'hidden',
                      border: '1px solid #d2d2d7',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                    }),
                    menuList: (base) => ({
                      ...base,
                      padding: '4px'
                    }),
                    singleValue: (base) => ({
                      ...base,
                      color: '#1d1d1f'
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: '#86868b'
                    })
                  }}
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
                  disabled={isSubmitting}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={!selectedEditor || isSubmitting}
                  className="sf-button-primary"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Zapisywanie...
                    </>
                  ) : (
                    'Zmień właściciela'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};