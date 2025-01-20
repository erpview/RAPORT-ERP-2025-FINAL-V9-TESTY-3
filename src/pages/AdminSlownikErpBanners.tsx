import React, { useEffect, useState } from 'react';
import { dictionaryService } from '../services/dictionary';
import { DictionaryTerm, DictionaryBanner } from '../types/dictionary';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Toggle } from '../components/ui/Toggle';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const AdminSlownikErpBanners: React.FC = () => {
  const [terms, setTerms] = useState<DictionaryTerm[]>([]);
  const [banners, setBanners] = useState<(DictionaryBanner & { term?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<DictionaryBanner | null>(null);
  const [formData, setFormData] = useState({
    term_id: '',
    image_url: '',
    link_url: '',
    active: true,
    display_on_all: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [termsData, bannersData] = await Promise.all([
        dictionaryService.getAllTerms(),
        dictionaryService.getAllBanners()
      ]);
      
      setTerms(termsData);
      
      // Process banners - for global banners, set term to 'Global'
      const bannersWithTerms = bannersData.map(banner => ({
        ...banner,
        term: banner.display_on_all ? 'Global' : (termsData.find(t => t.id === banner.term_id)?.term || '')
      }));
      
      setBanners(bannersWithTerms);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (banner?: DictionaryBanner & { term?: string }) => {
    if (banner) {
      const { term, ...originalBanner } = banner;
      setEditingBanner(originalBanner);
      setFormData({
        term_id: banner.display_on_all ? '' : (originalBanner.term_id?.toString() || ''),
        image_url: originalBanner.image_url,
        link_url: originalBanner.link_url || '',
        active: originalBanner.active,
        display_on_all: originalBanner.display_on_all
      });
    } else {
      setEditingBanner(null);
      setFormData({
        term_id: '',
        image_url: '',
        link_url: '',
        active: true,
        display_on_all: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setFormData({
      term_id: '',
      image_url: '',
      link_url: '',
      active: true,
      display_on_all: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bannerData = {
        ...formData,
        term_id: formData.term_id === '' ? null : parseInt(formData.term_id),
        display_on_all: formData.term_id === '',
      };

      if (editingBanner) {
        await dictionaryService.updateBanner(editingBanner.id, bannerData);
      } else {
        await dictionaryService.createBanner(bannerData);
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving banner:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten baner?')) {
      try {
        await dictionaryService.deleteBanner(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zarządzanie banerami słownika ERP</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj baner
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Termin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Podgląd
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Link
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {banners.map((banner) => (
              <tr key={banner.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{banner.term}</div>
                </td>
                <td className="px-6 py-4">
                  <img
                    src={banner.image_url}
                    alt="Banner preview"
                    className="h-16 w-auto object-contain"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {banner.link_url || '-'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      banner.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {banner.active ? 'Aktywny' : 'Nieaktywny'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    onClick={() => handleOpenModal(banner)}
                    className="mr-2"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(banner.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBanner ? 'Edytuj baner' : 'Dodaj nowy baner'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wyświetlanie banera
            </label>
            <div className="flex items-center gap-2">
              <Toggle
                label={formData.display_on_all ? 'Wyświetlaj na wszystkich hasłach' : 'Wyświetlaj na wybranym haśle'}
                checked={formData.display_on_all}
                onChange={(checked) => {
                  setFormData({ 
                    ...formData, 
                    display_on_all: checked,
                    term_id: checked ? '' : formData.term_id 
                  });
                }}
              />
            </div>
          </div>
          
          {!formData.display_on_all && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Termin
              </label>
              <Select
                value={formData.term_id}
                onChange={(e) => setFormData({ ...formData, term_id: e.target.value })}
                required={!formData.display_on_all}
                options={[
                  { value: '', label: 'Wybierz termin' },
                  ...terms.map((term) => ({
                    value: term.id.toString(),
                    label: term.term
                  }))
                ]}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL obrazu
            </label>
            <Input
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL linku (opcjonalnie)
            </label>
            <Input
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Toggle
              label={formData.active ? 'Aktywny' : 'Nieaktywny'}
              checked={formData.active}
              onChange={(checked) => setFormData({ ...formData, active: checked })}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Anuluj
            </Button>
            <Button type="submit">
              {editingBanner ? 'Zapisz zmiany' : 'Dodaj'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSlownikErpBanners;
