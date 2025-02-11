import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminSupabase as supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Layers, Pencil } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface SurveyAssignment {
  id: string;
  form_id: string;
  target_type: 'system' | 'company';
  target_id: string;
  created_at: string;
  created_by: string;
  form: {
    name: string;
  };
  target_name?: string;
}

export const AdminSurveyAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<SurveyAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<{ id: string; name: string; }[]>([]);
  const [systems, setSystems] = useState<{ id: string; name: string; }[]>([]);
  const [companies, setCompanies] = useState<{ id: string; name: string; }[]>([]);
  const [selectedForm, setSelectedForm] = useState('');
  const [selectedType, setSelectedType] = useState<'system' | 'company'>('system');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<SurveyAssignment | null>(null);
  
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
    loadData();
  }, [user, isAdmin, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAssignments(),
        loadForms(),
        loadSystems(),
        loadCompanies()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      console.log('Loading assignments...');
      const { data, error } = await supabase
        .from('survey_assignments')
        .select(`
          *,
          form:survey_forms(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading assignments:', error);
        throw error;
      }

      console.log('Loaded assignments:', data);

      // Load target names
      const assignments = await Promise.all(
        (data || []).map(async (assignment) => {
          let targetName = '';
          if (assignment.target_type === 'system') {
            const { data: system } = await supabase
              .from('systems')
              .select('name')
              .eq('id', assignment.target_id)
              .single();
            targetName = system?.name || '';
          } else {
            const { data: company } = await supabase
              .from('companies')
              .select('name')
              .eq('id', assignment.target_id)
              .single();
            targetName = company?.name || '';
          }
          return { ...assignment, target_name: targetName };
        })
      );

      console.log('Processed assignments:', assignments);
      setAssignments(assignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast.error('Błąd podczas ładowania przypisań');
    }
  };

  const loadForms = async () => {
    try {
      console.log('Loading forms...');
      const { data, error } = await supabase
        .from('survey_forms')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (error) {
        console.error('Error loading forms:', error);
        throw error;
      }

      console.log('Loaded forms:', data);
      setForms(data || []);
    } catch (error) {
      console.error('Error loading forms:', error);
      toast.error('Błąd podczas ładowania formularzy');
    }
  };

  const loadSystems = async () => {
    try {
      const { data, error } = await supabase
        .from('systems')
        .select('id, name')
        .eq('status', 'published')
        .order('name');
      
      if (error) {
        console.error('Error loading systems:', error);
        throw error;
      }

      setSystems(data || []);
    } catch (error) {
      console.error('Error loading systems:', error);
      toast.error('Błąd podczas ładowania systemów');
    }
  };

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error loading companies:', error);
        throw error;
      }

      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Błąd podczas ładowania firm');
    }
  };

  const handleEdit = (assignment: SurveyAssignment) => {
    setEditingAssignment(assignment);
    setSelectedForm(assignment.form_id);
    setSelectedType(assignment.target_type);
    setSelectedTarget(assignment.target_id);
    setShowAssignModal(true);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedForm || !selectedTarget) {
        toast.error('Wypełnij wszystkie pola');
        return;
      }

      if (editingAssignment) {
        // Update existing assignment
        const { error } = await supabase
          .from('survey_assignments')
          .update({
            form_id: selectedForm,
            target_type: selectedType,
            target_id: selectedTarget,
          })
          .eq('id', editingAssignment.id);

        if (error) throw error;
        toast.success('Przypisanie zostało zaktualizowane');
      } else {
        // Create new assignment
        const { error } = await supabase
          .from('survey_assignments')
          .insert({
            form_id: selectedForm,
            target_type: selectedType,
            target_id: selectedTarget,
            created_by: user?.id,
          });

        if (error) throw error;
        toast.success('Przypisanie zostało utworzone');
      }

      await loadAssignments();
      setSelectedForm('');
      setSelectedTarget('');
      setShowAssignModal(false);
      setEditingAssignment(null);
    } catch (error) {
      console.error('Error assigning form:', error);
      toast.error('Błąd podczas przypisywania formularza');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć to przypisanie?')) return;

    try {
      const { error } = await supabase
        .from('survey_assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Przypisanie zostało usunięte');
      loadAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Błąd podczas usuwania przypisania');
    }
  };

  const closeModal = () => {
    setShowAssignModal(false);
    setEditingAssignment(null);
    setSelectedForm('');
    setSelectedType('system');
    setSelectedTarget('');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1d1d1f]">Przypisania ankiet</h1>
            <p className="text-[15px] text-[#86868b] mt-1">
              {assignments.length} {assignments.length === 1 ? 'przypisanie' : 
                assignments.length > 1 && assignments.length < 5 ? 'przypisania' : 'przypisań'}
            </p>
          </div>
          <Button
            onClick={() => setShowAssignModal(true)}
            className="sf-button bg-[#007AFF] text-white hover:bg-[#007AFF]/90"
          >
            <Plus className="w-5 h-5 mr-2" />
            Dodaj przypisanie
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin">
              <Layers className="w-8 h-8 text-[#007AFF]" />
            </div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#86868b]">Brak przypisanych ankiet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[19px] font-semibold text-[#1d1d1f]">
                        {assignment.form.name}
                      </h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-[15px] text-[#86868b]">
                          {assignment.target_type === 'system' ? 'System' : 'Firma'}: {assignment.target_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleEdit(assignment)}
                        className="sf-button bg-[#007AFF] text-white hover:bg-[#007AFF]/90"
                      >
                        <Pencil className="w-5 h-5 mr-2" />
                        Edytuj
                      </Button>
                      <Button
                        onClick={() => handleDelete(assignment.id)}
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

        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-4">
                {editingAssignment ? 'Edytuj przypisanie' : 'Przypisz ankietę'}
              </h2>
              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-1">
                    Ankieta
                  </label>
                  <select
                    value={selectedForm}
                    onChange={(e) => setSelectedForm(e.target.value)}
                    className="sf-input w-full"
                    required
                  >
                    <option value="">Wybierz ankietę</option>
                    {forms.map((form) => (
                      <option key={form.id} value={form.id}>
                        {form.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-1">
                    Typ celu
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as 'system' | 'company')}
                    className="sf-input w-full"
                  >
                    <option value="system">System</option>
                    <option value="company">Firma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1d1d1f] mb-1">
                    {selectedType === 'system' ? 'System' : 'Firma'}
                  </label>
                  <select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    className="sf-input w-full"
                    required
                  >
                    <option value="">Wybierz {selectedType === 'system' ? 'system' : 'firmę'}</option>
                    {(selectedType === 'system' ? systems : companies).map((target) => (
                      <option key={target.id} value={target.id}>
                        {target.name}
                      </option>
                    ))}
                  </select>
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
                    {editingAssignment ? 'Zapisz' : 'Przypisz'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSurveyAssignments;
