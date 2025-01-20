import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Company } from '../types/company';
import { CompanyForm } from '../components/CompanyForm';
import { Modal } from '../components/ui/Modal';
import { Plus, Settings2, Pencil, Trash2, EyeOff, Eye, UserPlus2, Layers } from 'lucide-react';
import { ReassignCompanyOwnerModal } from '../components/ReassignCompanyOwnerModal';
import toast from 'react-hot-toast';
import {
  fetchAdminCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  updateCompanyStatus
} from '../services/companiesService';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

export const AdminCompanies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Partial<Company> | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reassignCompany, setReassignCompany] = useState<Company | null>(null);
  const { user, isAdmin, isEditor } = useAuth();
  const navigate = useNavigate();

  const loadCompanies = async () => {
    try {
      setLoading(true);
      // If user is editor, pass their ID to fetch only their companies
      const editorId = isEditor && user ? user.id : undefined;
      const data = await fetchAdminCompanies(editorId);
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [user?.id]);

  const handleCreate = () => {
    setSelectedCompany(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = async (company: Company) => {
    // Check if user has permission to edit this company
    if (!isAdmin && company.created_by !== user?.id) {
      alert('Nie masz uprawnień do edycji tej firmy.');
      return;
    }

    try {
      // Fetch the latest company data including field values
      const { data: companyData, error } = await supabase
        .from('companies')
        .select(`
          *,
          company_field_values (
            id,
            field_id,
            value
          )
        `)
        .eq('id', company.id)
        .single();

      if (error) throw error;

      setSelectedCompany(companyData);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching company data:', error);
      toast.error('Wystąpił błąd podczas ładowania danych firmy');
    }
  };

  const handleSave = async (data: Partial<Company>) => {
    try {
      setIsSaving(true);
      
      // Validate required fields
      if (!data.name || !data.street || !data.postal_code || !data.city || 
          !data.phone || !data.email || !data.nip || !data.description || !data.slug) {
        throw new Error('Wszystkie wymagane pola muszą być wypełnione');
      }

      // After validation, we know these fields exist
      const requiredFields = {
        name: data.name,
        street: data.street,
        postal_code: data.postal_code,
        city: data.city,
        phone: data.phone,
        email: data.email,
        nip: data.nip,
        description: data.description,
        slug: data.slug,
        status: (isAdmin && data.status) ? data.status : 'draft' as const,
      };
      
      // Prepare the company data with type safety
      const companyData = {
        ...requiredFields,
        status: isAdmin ? (data.status ?? 'draft') : 'draft',
        updated_by: user?.id,
        module_values: data.module_values ?? {},
        meta_title: data.meta_title ?? requiredFields.name,
        meta_description: data.meta_description ?? requiredFields.description.substring(0, 160),
        canonical_url: data.canonical_url ?? `/companies/${requiredFields.slug}`,
        website: data.website,
        logo_url: data.logo_url,
      };

      if (selectedCompany && 'id' in selectedCompany && selectedCompany.id) {
        await updateCompany(selectedCompany.id, companyData);
        toast.success('Firma została zaktualizowana');
      } else {
        const newCompanyData = {
          ...companyData,
          created_by: user?.id,
        };
        await createCompany(newCompanyData as Omit<Company, 'id'>);
        toast.success('Firma została dodana');
      }
      
      await loadCompanies();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving company:', error);
      const errorMessage = error?.message || error?.error_description || 'Wystąpił błąd podczas zapisywania firmy';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (company: Company) => {
    // Check if user has permission to delete this company
    if (!isAdmin && company.created_by !== user?.id) {
      alert('Nie masz uprawnień do usunięcia tej firmy.');
      return;
    }

    if (!window.confirm('Czy na pewno chcesz usunąć tę firmę?')) return;
    
    try {
      if (!company.id) {
        throw new Error('Brak ID firmy');
      }
      await deleteCompany(company.id);
      await loadCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Wystąpił błąd podczas usuwania firmy.');
    }
  };

  const handleTogglePublish = async (company: Company) => {
    // Check if user has permission to update this company
    if (!isAdmin) {
      alert('Nie masz uprawnień do zmiany statusu tej firmy.');
      return;
    }

    try {
      if (!company.id) {
        throw new Error('Brak ID firmy');
      }
      const newStatus = company.status === 'published' ? 'draft' : 'published';
      await updateCompanyStatus(company.id, newStatus);
      await loadCompanies();
    } catch (error) {
      console.error('Error updating company status:', error);
      alert('Wystąpił błąd podczas aktualizacji statusu firmy.');
    }
  };

  const handleCloseModal = () => {
    setSelectedCompany(undefined);
    setIsModalOpen(false);
    setIsSaving(false);
  };

  if (!isAdmin && !isEditor) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Brak dostępu
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Nie masz uprawnień do wyświetlenia tej strony.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F5F5F7] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Settings2 className="w-8 h-8 text-[#2c3b67]" />
              <h1 className="text-[32px] font-semibold text-[#1d1d1f]">
                {isAdmin ? 'Zarządzanie firmami' : 'Moje firmy'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin/company-modules')}
                  className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
                >
                  <Layers className="w-5 h-5 mr-2" />
                  MODUŁY FIRM
                </button>
              )}
              <button
                onClick={handleCreate}
                className="sf-button-primary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Dodaj firmę
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-[#86868b]">
                <div className="spinner" />
                <p className="text-[17px]">Ładowanie firm...</p>
              </div>
            </div>
          ) : companies.length === 0 ? (
            <div className="sf-card p-8 text-center">
              <p className="text-[17px] text-[#86868b]">
                {isAdmin ? 'Brak firm w systemie.' : 'Nie masz jeszcze żadnych firm.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="sf-card p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-[19px] font-semibold text-[#1d1d1f]">
                        {company.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-[15px] text-[#86868b]">
                          {company.city}
                        </p>
                        <span className={`text-[15px] ${
                          company.status === 'published' 
                            ? 'text-green-600' 
                            : 'text-yellow-600'
                        }`}>
                          {company.status === 'published' ? 'Opublikowany' : 'Szkic'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <button
                          onClick={() => setReassignCompany(company)}
                          className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
                        >
                          <UserPlus2 className="w-5 h-5 mr-2" />
                          Zmień właściciela
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(company)}
                        className="sf-button bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#E8E8ED]"
                      >
                        <Pencil className="w-5 h-5 mr-2" />
                        Edytuj
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleTogglePublish(company)}
                            className={`sf-button ${
                              company.status === 'published'
                                ? 'bg-[#FF9500] text-white hover:bg-[#FF9500]/90'
                                : 'bg-[#34C759] text-white hover:bg-[#34C759]/90'
                            }`}
                          >
                            {company.status === 'published' ? (
                              <><EyeOff className="w-5 h-5 mr-2" />Ukryj</>
                            ) : (
                              <><Eye className="w-5 h-5 mr-2" />Opublikuj</>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(company)}
                            className="sf-button bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90"
                          >
                            <Trash2 className="w-5 h-5 mr-2" />
                            Usuń
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedCompany ? 'Edytuj firmę' : 'Dodaj nową firmę'}
          maxWidth="max-w-5xl"
        >
          <CompanyForm
            company={selectedCompany}
            onSubmit={handleSave}
            isLoading={isSaving}
          />
        </Modal>
      )}

      {reassignCompany && reassignCompany.id && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <ReassignCompanyOwnerModal
            isOpen={true}
            onClose={() => setReassignCompany(null)}
            companyId={reassignCompany.id}
            currentOwner={reassignCompany.created_by ?? ''}
            onSuccess={loadCompanies}
          />
        </div>
      )}
    </>
  );
};
