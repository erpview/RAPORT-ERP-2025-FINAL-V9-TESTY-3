import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';
import { generatePartnerSEO } from '../utils/partnerSeoGenerator';

interface Partner {
  id: number;
  name: string;
  logo_url: string;
  website_url: string;
  is_main_partner: boolean;
  slug: string;
  order_index: number;
  partner_page?: PartnerPage;
}

interface PartnerPage {
  id?: number;
  partner_id: number;
  content: string;
  description: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  published: boolean;
  pdf_url?: string;
  video_url_1?: string;
  video_url_2?: string;
  form_banner_url?: string;
  form_url?: string;
}

interface CursorPositions {
  [key: string]: number;
}

const AdminPartners: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [mainPartners, setMainPartners] = useState<Partner[]>([]);
  const [techPartners, setTechPartners] = useState<Partner[]>([]);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editingPartnerPage, setEditingPartnerPage] = useState<PartnerPage | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [lastCursorPosition, setLastCursorPosition] = useState<CursorPositions>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    if (editingPartner) {
      // Restore cursor positions
      Object.keys(lastCursorPosition).forEach((fieldName) => {
        const input = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement | HTMLTextAreaElement;
        if (input) {
          input.selectionStart = lastCursorPosition[fieldName];
          input.selectionEnd = lastCursorPosition[fieldName];
        }
      });
    }
  }, [editingPartner, lastCursorPosition]);

  const fetchPartners = async () => {
    try {
      // Fetch partners with their corresponding partner pages
      const { data: partnersData, error: partnersError } = await supabase
        .from('partners')
        .select(`
          *,
          partner_page:partner_pages(*)
        `)
        .order('is_main_partner', { ascending: false })
        .order('order_index');

      if (partnersError) throw partnersError;

      // Transform the data to match our state structure
      const transformedData = partnersData.map(partner => ({
        ...partner,
        partner_page: partner.partner_page?.[0] || null
      }));

      setPartners(transformedData);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Błąd podczas pobierania partnerów');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPartnerPage = async (partnerId: number) => {
    try {
      const { data, error } = await supabase
        .from('partner_pages')
        .select('*')
        .eq('partner_id', partnerId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setEditingPartnerPage(data);
        setEditorContent(data.content || '');
      } else {
        setEditingPartnerPage({ 
          partner_id: partnerId, 
          content: '', 
          description: '', 
          meta_title: '', 
          meta_description: '', 
          meta_keywords: '', 
          published: false 
        });
        setEditorContent('');
      }
    } catch (error) {
      console.error('Error fetching partner page:', error);
      toast.error('Błąd podczas pobierania strony partnera');
    }
  };

  const handleEdit = async (partner: Partner) => {
    try {
      // Fetch fresh partner data
      const { data: freshPartner, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', partner.id)
        .single();

      if (error) throw error;
      setEditingPartner(freshPartner);
      fetchPartnerPage(partner.id);
    } catch (error) {
      console.error('Error fetching partner details:', error);
      toast.error('Błąd podczas pobierania danych partnera');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      if (editingPartner) {
        // Update partner data
        const { error: updateError } = await supabase
          .from('partners')
          .update({
            name: formData.get('name'),
            logo_url: formData.get('logo_url'),
            website_url: formData.get('website_url'),
            is_main_partner: formData.get('is_main_partner') === 'true',
            slug: formData.get('slug'),
            order_index: parseInt(formData.get('order_index') as string) || 0,
          })
          .eq('id', editingPartner.id);

        if (updateError) throw updateError;

        // Generate SEO for updated partner
        await generatePartnerSEO({
          name: formData.get('name') as string,
          slug: formData.get('slug') as string,
          website_url: formData.get('website_url') as string,
          meta_keywords: formData.get('meta_keywords') as string
        });

        // Handle partner page data
        const pageData = {
          partner_id: editingPartner.id,
          content: editorContent,
          description: formData.get('description') as string || null,
          meta_title: formData.get('meta_title') as string || null,
          meta_description: formData.get('meta_description') as string || null,
          meta_keywords: formData.get('meta_keywords') as string || null,
          pdf_url: formData.get('pdf_url') as string || null,
          video_url_1: formData.get('video_url_1') as string || null,
          video_url_2: formData.get('video_url_2') as string || null,
          form_banner_url: formData.get('form_banner_url') as string || null,
          form_url: formData.get('form_url') as string || null,
          published: editingPartnerPage?.published ?? true
        };

        if (editingPartnerPage?.id) {
          // Update existing partner page
          const { error: pageUpdateError } = await supabase
            .from('partner_pages')
            .update(pageData)
            .eq('id', editingPartnerPage.id);

          if (pageUpdateError) throw pageUpdateError;
        } else {
          // Create new partner page
          const { error: pageInsertError } = await supabase
            .from('partner_pages')
            .insert([pageData]);

          if (pageInsertError) throw pageInsertError;
        }

        toast.success('Partner został zaktualizowany');
        fetchPartners();
        setEditingPartner(null);
        setEditingPartnerPage(null);
      } else {
        // Create new partner
        const { data: newPartner, error: createError } = await supabase
          .from('partners')
          .insert({
            name: formData.get('name'),
            logo_url: formData.get('logo_url'),
            website_url: formData.get('website_url'),
            is_main_partner: formData.get('is_main_partner') === 'true',
            slug: formData.get('slug'),
            order_index: partners.length + 1
          })
          .select()
          .single();

        if (createError) throw createError;

        // Generate SEO for new partner
        if (newPartner) {
          await generatePartnerSEO({
            name: newPartner.name,
            slug: newPartner.slug,
            website_url: newPartner.website_url,
            meta_keywords: formData.get('meta_keywords') as string
          });
        }

        // Handle partner page data
        const pageData = {
          partner_id: newPartner.id,
          content: editorContent,
          description: formData.get('description') as string || null,
          meta_title: formData.get('meta_title') as string || null,
          meta_description: formData.get('meta_description') as string || null,
          meta_keywords: formData.get('meta_keywords') as string || null,
          pdf_url: formData.get('pdf_url') as string || null,
          video_url_1: formData.get('video_url_1') as string || null,
          video_url_2: formData.get('video_url_2') as string || null,
          form_banner_url: formData.get('form_banner_url') as string || null,
          form_url: formData.get('form_url') as string || null,
          published: true
        };

        // Create new partner page
        const { error: pageInsertError } = await supabase
          .from('partner_pages')
          .insert([pageData]);

        if (pageInsertError) throw pageInsertError;

        toast.success('Partner został dodany');
        fetchPartners();
        setEditingPartner(null);
        setEditingPartnerPage(null);
      }
    } catch (error) {
      console.error('Error saving partner:', error);
      toast.error('Wystąpił błąd podczas zapisywania partnera');
    }
  };

  const togglePublish = async (partnerId: number, currentPublishState: boolean) => {
    const toastId = toast.loading(currentPublishState ? 'Ukrywanie...' : 'Publikowanie...');
    try {
      const { error } = await supabase
        .from('partner_pages')
        .update({ published: !currentPublishState })
        .eq('partner_id', partnerId);

      if (error) throw error;

      // Update local state
      setEditingPartnerPage(prev => 
        prev ? { ...prev, published: !currentPublishState } : null
      );

      toast.success(
        currentPublishState ? 'Strona została ukryta' : 'Strona została opublikowana', 
        { id: toastId }
      );
      await fetchPartners(); // Refresh the list
    } catch (error) {
      console.error('Error toggling publish state:', error);
      toast.error('Wystąpił błąd podczas zmiany statusu publikacji', { id: toastId });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, selectionStart } = e.target;
    setLastCursorPosition((prev) => ({
      ...prev,
      [name]: selectionStart || 0
    }));
    
    if (editingPartner) {
      setEditingPartner({
        ...editingPartner,
        [name]: value
      });
    }
  };

  const handleCloseForm = () => {
    setEditingPartner(null);
    setEditingPartnerPage(null);
    setEditorContent('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Admin - Zarządzanie Partnerami</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Zarządzanie Partnerami</h1>

        <div className="space-y-8">
          {/* Partner Form */}
          {editingPartner && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">
                Edycja strony partnera: {editingPartner.name}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Krótki opis
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={editingPartnerPage?.description || ''}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    id="meta_title"
                    name="meta_title"
                    defaultValue={editingPartnerPage?.meta_title || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    defaultValue={editingPartnerPage?.meta_description || ''}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="meta_keywords" className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    id="meta_keywords"
                    name="meta_keywords"
                    defaultValue={editingPartnerPage?.meta_keywords || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="pdf_url" className="block text-sm font-medium text-gray-700">
                    Link do PDF
                  </label>
                  <input
                    type="url"
                    name="pdf_url"
                    id="pdf_url"
                    value={editingPartnerPage?.pdf_url || ''}
                    onChange={(e) =>
                      setEditingPartnerPage(prev => ({ ...prev!, pdf_url: e.target.value }))
                    }
                    placeholder="https://example.com/partner-info.pdf"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="video_url_1" className="block text-sm font-medium text-gray-700">
                    Link do filmu 1 (YouTube lub Vimeo)
                  </label>
                  <input
                    type="url"
                    name="video_url_1"
                    id="video_url_1"
                    value={editingPartnerPage?.video_url_1 || ''}
                    onChange={(e) =>
                      setEditingPartnerPage(prev => ({ ...prev!, video_url_1: e.target.value }))
                    }
                    placeholder="https://youtube.com/watch?v=... lub https://vimeo.com/..."
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="video_url_2" className="block text-sm font-medium text-gray-700">
                    Link do filmu 2 (YouTube lub Vimeo)
                  </label>
                  <input
                    type="url"
                    name="video_url_2"
                    id="video_url_2"
                    value={editingPartnerPage?.video_url_2 || ''}
                    onChange={(e) =>
                      setEditingPartnerPage(prev => ({ ...prev!, video_url_2: e.target.value }))
                    }
                    placeholder="https://youtube.com/watch?v=... lub https://vimeo.com/..."
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="form_banner_url" className="block text-sm font-medium text-gray-700">
                    Link do baneru formularza
                  </label>
                  <input
                    type="url"
                    name="form_banner_url"
                    id="form_banner_url"
                    value={editingPartnerPage?.form_banner_url || ''}
                    onChange={(e) =>
                      setEditingPartnerPage(prev => ({ ...prev!, form_banner_url: e.target.value }))
                    }
                    placeholder="https://example.com/form-banner.jpg"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="form_url" className="block text-sm font-medium text-gray-700">
                    Link do formularza
                  </label>
                  <input
                    type="url"
                    name="form_url"
                    id="form_url"
                    value={editingPartnerPage?.form_url || ''}
                    onChange={(e) =>
                      setEditingPartnerPage(prev => ({ ...prev!, form_url: e.target.value }))
                    }
                    placeholder="https://example.com/form"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                {/* WYSIWYG Editor for Partner Page Content */}
                {editingPartnerPage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Treść strony (WYSIWYG)
                    </label>
                    <div style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}>
                      <Editor
                        apiKey="nr4bkkr4ubtgu4fo46groor1yc0xfek3okk7emvcletrsluo"
                        initialValue={editingPartnerPage.content}
                        init={{
                          height: 500,
                          menubar: true,
                          plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'help', 'wordcount'
                          ],
                          toolbar: 'undo redo | formatselect | ' +
                            'bold italic backcolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'removeformat',
                          content_style: `
                            body { 
                              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                              font-size: 16px;
                              color: #333;
                              background: #fff;
                              margin: 1rem;
                            }
                          `,
                          setup: function(editor) {
                            editor.on('init', () => {
                              editor.setContent(editingPartnerPage?.content || '');
                            });

                            editor.on('Change', () => {
                              const content = editor.getContent();
                              setEditorContent(content);
                            });
                          },
                          language: 'pl',
                          language_url: '/tinymce/langs/pl.js',
                          browser_spellcheck: true,
                          convert_urls: false,
                          relative_urls: false,
                          remove_script_host: false
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Zapisz
                  </button>
                  <button 
                    type="button" 
                    onClick={() => togglePublish(editingPartner.id, editingPartnerPage?.published ?? false)}
                    className={`px-4 py-2 text-sm font-medium ${editingPartnerPage?.published ? "bg-red-600" : "bg-green-600"} border border-transparent rounded-md hover:bg-${editingPartnerPage?.published ? "red-700" : "green-700"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${editingPartnerPage?.published ? "red-500" : "green-500"}`}
                  >
                    {editingPartnerPage?.published ? 'Ukryj' : 'Publikuj'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Partners List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Lista partnerów</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {partners.map((partner) => (
                  <div
                    key={partner.id}
                    className="border rounded-lg p-4 flex flex-col"
                  >
                    <div className="aspect-w-16 aspect-h-9 flex items-center justify-center mb-4">
                      <img
                        src={partner.logo_url}
                        alt={partner.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    {partner.partner_page?.description && (
                      <p className="text-sm text-gray-600 mt-2 mb-4 line-clamp-2 text-center">
                        {partner.partner_page.description}
                      </p>
                    )}
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(partner)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Edytuj
                      </button>
                      <button
                        onClick={() => togglePublish(partner.id, partner.partner_page?.published ?? false)}
                        className={`px-3 py-1.5 text-sm font-medium text-white ${partner.partner_page?.published ? "bg-red-600" : "bg-green-600"} border border-transparent rounded-md hover:bg-${partner.partner_page?.published ? "red-700" : "green-700"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${partner.partner_page?.published ? "red-500" : "green-500"}`}
                      >
                        {partner.partner_page?.published ? 'Ukryj' : 'Publikuj'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPartners;
