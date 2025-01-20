import React, { useEffect, useState, useRef } from 'react';
import { dictionaryService } from '../services/dictionary';
import { DictionaryTerm } from '../types/dictionary';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Modal } from '../components/ui/Modal';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';

const AdminSlownikErp: React.FC = () => {
  const [terms, setTerms] = useState<DictionaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<DictionaryTerm | null>(null);
  const [formData, setFormData] = useState({
    term: '',
    explanation: ''
  });

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const data = await dictionaryService.getAllTerms();
      setTerms(data);
    } catch (error) {
      console.error('Error fetching terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (term?: DictionaryTerm) => {
    if (term) {
      setEditingTerm(term);
      setFormData({
        term: term.term,
        explanation: term.explanation
      });
    } else {
      setEditingTerm(null);
      setFormData({
        term: '',
        explanation: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTerm(null);
    setFormData({
      term: '',
      explanation: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTerm) {
        await dictionaryService.updateTerm(editingTerm.id, formData);
      } else {
        await dictionaryService.createTerm(formData);
      }
      handleCloseModal();
      fetchTerms();
    } catch (error) {
      console.error('Error saving term:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę definicję?')) {
      try {
        await dictionaryService.deleteTerm(id);
        fetchTerms();
      } catch (error) {
        console.error('Error deleting term:', error);
      }
    }
  };

  const ImportTermsSection: React.FC = () => {
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ success: number; errors: string[] }>({ success: 0, errors: [] });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setImporting(true);
      setImportResult({ success: 0, errors: [] });

      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const terms = results.data.map((row: any) => ({
              term: row.term?.trim(),
              explanation: row.explanation?.trim(),
              tags: row.tags?.split(';').map((tag: string) => tag.trim()).filter(Boolean) || [],
              related_terms: row.related_terms?.split(';').map((term: string) => term.trim()).filter(Boolean) || []
            }));

            // Filter out invalid entries
            const validTerms = terms.filter(term => term.term && term.explanation);
            const errors = terms
              .map((term, index) => (!term.term || !term.explanation ? `Row ${index + 1}: Missing term or definition` : null))
              .filter(Boolean) as string[];

            if (validTerms.length > 0) {
              const { error } = await dictionaryService.createTerms(validTerms);

              if (error) {
                setImportResult(prev => ({
                  ...prev,
                  errors: [...prev.errors, `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`]
                }));
              } else {
                setImportResult(prev => ({
                  ...prev,
                  success: validTerms.length
                }));
              }
            }

            if (errors.length > 0) {
              setImportResult(prev => ({
                ...prev,
                errors: [...prev.errors, ...errors]
              }));
            }
          } catch (error) {
            setImportResult(prev => ({
              ...prev,
              errors: [...prev.errors, `Processing error: ${error instanceof Error ? error.message : String(error)}`]
            }));
          } finally {
            setImporting(false);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }
        },
        error: (error) => {
          setImportResult(prev => ({
            ...prev,
            errors: [...prev.errors, `CSV parsing error: ${error instanceof Error ? error.message : String(error)}`]
          }));
          setImporting(false);
        }
      });
    };

    return (
      <div className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Import Terms from CSV</h2>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              Upload a CSV file with the following columns: term, explanation, tags (optional), related_terms (optional).
              Separate multiple tags and related terms with semicolons.
            </p>
            <a 
              href="/sample-terms.csv" 
              download 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Download sample CSV template
            </a>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
              id="csv-upload"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {importing ? 'Importing...' : 'Upload CSV'}
            </Button>
          </div>

          {(importResult.success > 0 || importResult.errors.length > 0) && (
            <div className="mt-4">
              {importResult.success > 0 && (
                <p className="text-green-600 mb-2">
                  Successfully imported {importResult.success} terms
                </p>
              )}
              {importResult.errors.length > 0 && (
                <div className="text-red-600">
                  <p className="mb-1">Errors:</p>
                  <ul className="list-disc list-inside">
                    {importResult.errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
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
        <h1 className="text-2xl font-bold">Zarządzanie słownikiem ERP</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj definicję
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Termin
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {terms.map((term) => (
              <tr key={term.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{term.term}</div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Button
                    variant="ghost"
                    onClick={() => handleOpenModal(term)}
                    className="mr-2"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(term.id)}
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

      <ImportTermsSection />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTerm ? 'Edytuj definicję' : 'Dodaj nową definicję'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Termin
            </label>
            <Input
              value={formData.term}
              onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Definicja
            </label>
            <TextArea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              required
              rows={6}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Anuluj
            </Button>
            <Button type="submit">
              {editingTerm ? 'Zapisz zmiany' : 'Dodaj'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminSlownikErp;
