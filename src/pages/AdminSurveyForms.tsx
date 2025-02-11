import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

// Define the interface locally since it's specific to this component
interface SurveyFormData {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'inactive';
  created_by: string;
}

const AdminSurveyForms = () => {
  const [forms, setForms] = useState<SurveyFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [editingForm, setEditingForm] = useState<SurveyFormData | null>(null);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }
    if (!isAdmin) {
      navigate('/admin/systemy');
      return;
    }
    loadForms();
  }, [user, isAdmin, navigate]);

  const loadForms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('survey_forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading forms:', error);
        toast.error('Błąd podczas ładowania formularzy');
        return;
      }
      setForms(data || []);
    } catch (error) {
      console.error('Error loading forms:', error);
      toast.error('Błąd podczas ładowania formularzy');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (!formName.trim()) {
        toast.error('Nazwa formularza jest wymagana');
        return;
      }

      if (!user?.id) {
        toast.error('Musisz być zalogowany aby utworzyć formularz');
        return;
      }

      const newForm = {
        name: formName.trim(),
        description: formDescription.trim() || null,
        status: 'draft',
        created_by: user.id
      };

      console.log('Creating form with data:', newForm);

      const { data, error } = await supabase
        .from('survey_forms')
        .insert(newForm)
        .select()
        .single();

      if (error) {
        console.error('Error creating form:', error);
        toast.error(`Błąd podczas tworzenia formularza: ${error.message}`);
        return;
      }

      if (!data) {
        toast.error('Nie udało się utworzyć formularza');
        return;
      }

      console.log('Form created successfully:', data);
      toast.success('Formularz został utworzony');
      setShowCreateModal(false);
      setFormName('');
      setFormDescription('');
      await loadForms();
      // Navigate to form editor to add modules and fields
      navigate(`/admin/ankiety/${data.id}/edycja`);
    } catch (error) {
      console.error('Error creating form:', error);
      toast.error('Błąd podczas tworzenia formularza');
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten formularz?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('survey_forms')
        .delete()
        .eq('id', formId);

      if (error) {
        console.error('Error deleting form:', error);
        toast.error('Błąd podczas usuwania formularza');
        return;
      }

      toast.success('Formularz został usunięty');
      await loadForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Błąd podczas usuwania formularza');
    }
  };

  const handleEditClick = (form: SurveyFormData) => {
    setEditingForm(form);
    setFormName(form.name);
    setFormDescription(form.description || '');
    setShowEditModal(true);
  };

  const handleEditForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (!formName.trim()) {
        toast.error('Nazwa formularza jest wymagana');
        return;
      }

      if (!editingForm) {
        return;
      }

      const { error } = await supabase
        .from('survey_forms')
        .update({
          name: formName.trim(),
          description: formDescription.trim() || null,
        })
        .eq('id', editingForm.id);

      if (error) {
        console.error('Error updating form:', error);
        toast.error('Błąd podczas aktualizacji formularza');
        return;
      }

      toast.success('Formularz został zaktualizowany');
      setShowEditModal(false);
      setFormName('');
      setFormDescription('');
      setEditingForm(null);
      await loadForms();
    } catch (error) {
      console.error('Error updating form:', error);
      toast.error('Błąd podczas aktualizacji formularza');
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setFormName('');
    setFormDescription('');
    setEditingForm(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1d1d1f]">Ankiety</h1>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => navigate('/admin/ankiety/przypisania')}
                className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
              >
                <Layers className="w-4 h-4 mr-2" />
                Przypisania ankiet
              </Button>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="sf-button bg-[#007AFF] text-white hover:bg-[#007AFF]/90"
          >
            <Plus className="w-5 h-5 mr-2" />
            Dodaj ankietę
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin">
              <Layers className="w-8 h-8 text-[#007AFF]" />
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {forms.map((form) => (
              <div key={form.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[19px] font-semibold text-[#1d1d1f]">
                        {form.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-[15px] text-[#86868b]">
                          {form.description || 'Brak opisu'}
                        </p>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          form.status === 'active' ? 'bg-[#34C759]/10 text-[#34C759]' :
                          form.status === 'draft' ? 'bg-[#FF9500]/10 text-[#FF9500]' :
                          'bg-[#8E8E93]/10 text-[#8E8E93]'
                        }`}>
                          {form.status === 'active' ? 'Aktywna' :
                           form.status === 'draft' ? 'Szkic' :
                           'Nieaktywna'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleEditClick(form)}
                        className="sf-button bg-[#007AFF] text-white hover:bg-[#007AFF]/90"
                      >
                        <Pencil className="w-5 h-5 mr-2" />
                        Edytuj dane
                      </Button>
                      <Button
                        onClick={() => navigate(`/admin/ankiety/${form.id}/edycja`)}
                        className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
                      >
                        <Pencil className="w-5 h-5 mr-2" />
                        Edytuj pola
                      </Button>
                      <Button
                        onClick={() => handleDeleteForm(form.id)}
                        className="sf-button bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90"
                      >
                        <Trash2 className="w-5 h-5 mr-2" />
                        Usuń
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={showCreateModal || showEditModal}
          onClose={closeModal}
          title={editingForm ? "Edytuj ankietę" : "Dodaj nową ankietę"}
        >
          <form onSubmit={editingForm ? handleEditForm : handleCreateForm} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#1d1d1f] mb-1">
                Nazwa ankiety
              </label>
              <input
                type="text"
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="sf-input w-full"
                placeholder="Wprowadź nazwę ankiety"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#1d1d1f] mb-1">
                Opis (opcjonalny)
              </label>
              <textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="sf-input w-full min-h-[100px]"
                placeholder="Wprowadź opis ankiety"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                onClick={closeModal}
                className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                className="sf-button bg-[#007AFF] text-white hover:bg-[#007AFF]/90"
              >
                {editingForm ? 'Zapisz' : 'Dodaj'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminSurveyForms;
