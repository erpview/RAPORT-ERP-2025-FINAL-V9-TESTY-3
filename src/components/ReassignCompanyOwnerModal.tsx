import React, { useState, useEffect } from 'react';
import { UserPlus2, Loader2, X } from 'lucide-react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

interface ReassignCompanyOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  currentOwner: string;
  onSuccess: () => void;
}

interface Editor {
  user_id: string;
  email: string;
}

export const ReassignCompanyOwnerModal: React.FC<ReassignCompanyOwnerModalProps> = ({
  isOpen,
  onClose,
  companyId,
  currentOwner,
  onSuccess
}) => {
  const [editors, setEditors] = useState<Editor[]>([]);
  const [selectedEditor, setSelectedEditor] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadEditors = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_management')
          .select('user_id, email')
          .eq('role', 'editor')
          .eq('is_active', true)
          .neq('user_id', currentOwner);

        if (error) throw error;
        setEditors(data || []);
      } catch (error) {
        console.error('Error loading editors:', error);
        toast.error('Nie udało się załadować listy edytorów');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadEditors();
    }
  }, [isOpen, currentOwner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditor) {
      toast.error('Wybierz nowego właściciela');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('companies')
        .update({ created_by: selectedEditor })
        .eq('id', companyId);

      if (error) throw error;

      toast.success('Właściciel został zmieniony');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error reassigning company:', error);
      toast.error('Nie udało się zmienić właściciela');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <UserPlus2 className="w-6 h-6 text-[#2c3b67]" />
            <h2 className="text-[24px] font-semibold text-[#1d1d1f]">
              Zmień właściciela firmy
            </h2>
          </div>
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
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="editor" className="block text-sm font-medium text-[#1d1d1f] mb-2">
                Wybierz nowego właściciela
              </label>
              <select
                id="editor"
                value={selectedEditor}
                onChange={(e) => setSelectedEditor(e.target.value)}
                className="sf-select w-full"
                required
              >
                <option value="">Wybierz edytora</option>
                {editors.map((editor) => (
                  <option key={editor.user_id} value={editor.user_id}>
                    {editor.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={saving}
                className="sf-button bg-[#2c3b67] text-white hover:bg-[#2c3b67]/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  <>
                    <UserPlus2 className="w-5 h-5 mr-2" />
                    Zmień właściciela
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
