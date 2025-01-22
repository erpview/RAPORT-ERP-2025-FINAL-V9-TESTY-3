import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminSupabase } from '../config/supabase';
import { Button } from '../components/ui/Button';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Editor } from '@tinymce/tinymce-react';
import { toast } from 'react-hot-toast';
import tinymce from 'tinymce';
import { Helmet } from 'react-helmet-async';
import { HelpCircle, Search } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

interface Slide {
  id: number;
  title: string;
  image_url: string;
  link_url: string;
  overlay_heading: string;
  overlay_description: string | null;
  button_text: string;
  button_url: string;
  order_index: number;
  overlay_image_url: string | null;
}

interface Partner {
  id: number;
  name: string;
  logo_url: string;
  website_url: string;
  is_main_partner: boolean;
  order_index: number;
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  order_index: number;
}

export default function AdminHome() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [mainPartners, setMainPartners] = useState<Partner[]>([]);
  const [techPartners, setTechPartners] = useState<Partner[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [content, setContent] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorKey, setEditorKey] = useState(0);
  const [editorCursorPosition, setEditorCursorPosition] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all data
      const [slidesRes, partnersRes, faqRes, contentRes] = await Promise.all([
        adminSupabase.from('slides').select('*').order('id'),
        adminSupabase.from('partners').select('*').order('order_index'),
        adminSupabase.from('faq').select('*').order('order_index'),
        adminSupabase.from('homepage_content').select('*').single()
      ]);

      if (slidesRes.data) setSlides(slidesRes.data);
      if (partnersRes.data) {
        setPartners(partnersRes.data);
        setMainPartners(partnersRes.data.filter(p => p.is_main_partner));
        setTechPartners(partnersRes.data.filter(p => !p.is_main_partner));
      }
      if (faqRes.data) setFaqItems(faqRes.data);
      if (contentRes.data) {
        const htmlContent = contentRes.data.content || '';
        console.log('Fetched content:', htmlContent);
        setContent(htmlContent);
        setEditorContent(htmlContent);
        setEditorKey(prev => prev + 1);
      } else {
        // If no content exists, initialize with empty string
        setContent('');
        setEditorContent('');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async () => {
    const toastId = toast.loading('Zapisywanie zawartości...');
    try {
      // Ensure we're sending the raw HTML content
      const htmlContent = editorContent;
      console.log('Raw HTML content to save:', htmlContent);

      // First check if the row exists
      const { data: existingRow } = await adminSupabase
        .from('homepage_content')
        .select('id')
        .single();

      if (!existingRow) {
        console.log('No existing row, creating new one');
        const { error: insertError } = await adminSupabase
          .from('homepage_content')
          .insert({
            content: htmlContent,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
      } else {
        console.log('Updating existing row');
        const { error: updateError } = await adminSupabase
          .from('homepage_content')
          .update({
            content: htmlContent,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRow.id);

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
      }

      // Verify the save by fetching the content back
      const { data: verifyData, error: verifyError } = await adminSupabase
        .from('homepage_content')
        .select('content')
        .single();

      if (verifyError) {
        console.error('Verify error:', verifyError);
        throw verifyError;
      }

      console.log('Verified saved content:', verifyData.content);

      // Update local state
      setContent(htmlContent);
      toast.success('Zawartość została zapisana', { id: toastId });
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Błąd podczas zapisywania zawartości', { id: toastId });
    }
  };

  const addSlide = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const { error } = await adminSupabase
        .from('slides')
        .insert({
          title: formData.get('title'),
          image_url: formData.get('image_url'),
          link_url: formData.get('link_url'),
          overlay_heading: formData.get('overlay_heading'),
          overlay_description: formData.get('overlay_description'),
          button_text: formData.get('button_text'),
          button_url: formData.get('button_url'),
          order_index: slides.length + 1,
          overlay_image_url: formData.get('overlay_image_url')
        });

      if (error) throw error;
      toast.success('Slide added successfully');
      fetchData();
      form.reset();
    } catch (err) {
      console.error('Error adding slide:', err);
      toast.error('Failed to add slide');
    }
  };

  const addFaqItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    // Get the raw HTML content from TinyMCE
    const answerInput = document.getElementById('answer') as HTMLInputElement;
    const answer = answerInput?.value || '';

    try {
      const { error } = await adminSupabase
        .from('faq')
        .insert({
          question: formData.get('question'),
          answer: answer,
          order_index: faqItems.length + 1
        });

      if (error) throw error;
      toast.success('FAQ item added successfully');
      fetchData();
      form.reset();
    } catch (err) {
      console.error('Error adding FAQ item:', err);
      toast.error('Failed to add FAQ item');
    }
  };

  const handleSlideReorder = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({
      ...item,
      order_index: index + 1,
    }));

    setSlides(items);

    try {
      const { error } = await adminSupabase
        .from('slides')
        .upsert(updates);

      if (error) throw error;
      toast.success('Slides reordered successfully');
    } catch (err) {
      console.error('Error reordering slides:', err);
      toast.error('Failed to reorder slides');
    }
  };

  const handleFaqReorder = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(faqItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      order_index: index + 1,
    }));

    setFaqItems(items);

    try {
      const { error } = await adminSupabase
        .from('faq')
        .upsert(updates);

      if (error) throw error;
      toast.success('FAQ items reordered successfully');
    } catch (err) {
      console.error('Error reordering FAQ items:', err);
      toast.error('Failed to reorder FAQ items');
    }
  };

  const deleteSlide = async (id: number) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;
    
    try {
      const { error } = await adminSupabase
        .from('slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Slide deleted successfully');
      fetchData();
    } catch (err) {
      console.error('Error deleting slide:', err);
      toast.error('Failed to delete slide');
    }
  };

  const updateSlide = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingSlide) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      // Update slide directly in the table
      const { error: updateError } = await adminSupabase
        .from('slides')
        .update({
          title: formData.get('title'),
          image_url: formData.get('image_url'),
          link_url: formData.get('link_url'),
          overlay_heading: formData.get('overlay_heading')?.toString() || '',
          overlay_description: formData.get('overlay_description')?.toString() || '',
          button_text: formData.get('button_text')?.toString() || '',
          button_url: formData.get('button_url')?.toString() || '',
          overlay_image_url: formData.get('overlay_image_url')?.toString() || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', editingSlide.id);

      if (updateError) {
        console.error('Error updating slide:', updateError);
        throw updateError;
      }

      toast.success('Slide updated successfully');
      setEditingSlide(null);
      fetchData();
    } catch (err) {
      console.error('Error updating slide:', err);
      toast.error('Failed to update slide');
    }
  };

  const deleteFaqItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this FAQ item?')) return;
    
    try {
      const { error } = await adminSupabase
        .from('faq')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('FAQ item deleted successfully');
      fetchData();
    } catch (err) {
      console.error('Error deleting FAQ item:', err);
      toast.error('Failed to delete FAQ item');
    }
  };

  const updateFaqItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingFaq) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    
    // Get the raw HTML content from TinyMCE
    const answerInput = document.getElementById('answer-modal') as HTMLInputElement;
    const answer = answerInput?.value || '';

    try {
      const { error } = await adminSupabase
        .from('faq')
        .update({
          question: formData.get('question'),
          answer: answer,
        })
        .eq('id', editingFaq.id);

      if (error) throw error;
      toast.success('FAQ item updated successfully');
      setEditingFaq(null);
      fetchData();
    } catch (err) {
      console.error('Error updating FAQ item:', err);
      toast.error('Failed to update FAQ item');
    }
  };

  const addPartner = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const { error } = await adminSupabase
        .from('partners')
        .insert({
          name: formData.get('name'),
          logo_url: formData.get('logo_url'),
          website_url: formData.get('website_url'),
          is_main_partner: formData.get('is_main_partner') === 'true',
          order_index: partners.length + 1
        });

      if (error) throw error;
      toast.success('Partner added successfully');
      fetchData();
      form.reset();
    } catch (err) {
      console.error('Error adding partner:', err);
      toast.error('Failed to add partner');
    }
  };

  const deletePartner = async (id: number) => {
    if (!confirm('Are you sure you want to delete this partner?')) return;
    
    try {
      const { error } = await adminSupabase
        .from('partners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Partner deleted successfully');
      fetchData();
    } catch (err) {
      console.error('Error deleting partner:', err);
      toast.error('Failed to delete partner');
    }
  };

  const updatePartner = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingPartner) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const { error } = await adminSupabase
        .from('partners')
        .update({
          name: formData.get('name'),
          logo_url: formData.get('logo_url'),
          website_url: formData.get('website_url'),
        })
        .eq('id', editingPartner.id);

      if (error) throw error;
      toast.success('Partner updated successfully');
      setEditingPartner(null);
      fetchData();
    } catch (err) {
      console.error('Error updating partner:', err);
      toast.error('Failed to update partner');
    }
  };

  const handlePartnerReorder = async (result: any, isMainPartner: boolean) => {
    if (!result.destination) return;

    const items = Array.from(isMainPartner ? mainPartners : techPartners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({
      ...item,
      order_index: index + 1,
    }));

    if (isMainPartner) {
      setMainPartners(items);
    } else {
      setTechPartners(items);
    }

    try {
      const { error } = await adminSupabase
        .from('partners')
        .upsert(updates);

      if (error) throw error;
      toast.success('Partners reordered successfully');
    } catch (err) {
      console.error('Error reordering partners:', err);
      toast.error('Failed to reorder partners');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Admin - Zarządzanie Stroną Główną</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Zarządzanie Stroną Główną</h1>

        {/* Quick Navigation Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Szybka nawigacja</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link to="/admin/partners">
              <Button type="button" variant="secondary" className="w-full">
                Strony partnerów
              </Button>
            </Link>
            <Link to="/admin/slownik-erp">
              <Button type="button" variant="secondary" className="w-full">
                Słownik ERP
              </Button>
            </Link>
            <Link to="/admin/slownik-erp/banery">
              <Button type="button" variant="secondary" className="w-full">
                Banery słownika
              </Button>
            </Link>
            <Link to="/admin/seo">
              <Button type="button" variant="secondary" className="w-full">
                <Search className="w-5 h-5 mr-2" />
                Zarządzanie SEO
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Homepage Content Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Zawartość strony głównej</h2>
              <div className="space-y-4">
                <div style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}>
                  <Editor
                    id="homepage-editor"
                    key={editorKey}
                    apiKey="nr4bkkr4ubtgu4fo46groor1yc0xfek3okk7emvcletrsluo"
                    initialValue={content}
                    init={{
                      height: 500,
                      menubar: true,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
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
                          setEditorContent(content);
                        });
                        editor.on('change', () => {
                          const rawContent = editor.getContent({format: 'html', no_events: true});
                          console.log('Raw HTML from change:', rawContent);
                          setEditorContent(rawContent);
                        });
                      },
                      language: 'pl',
                      language_url: '/tinymce/langs/pl.js',
                      browser_spellcheck: true,
                      convert_urls: false,
                      relative_urls: false,
                      remove_script_host: false,
                      entity_encoding: 'raw',
                      verify_html: false,
                      cleanup: false,
                      valid_elements: '*[*]'
                    }}
                    onEditorChange={(content, editor) => {
                      const rawContent = editor.getContent({format: 'html', no_events: true});
                      console.log('Raw HTML from editor change:', rawContent);
                      setEditorContent(rawContent);
                    }}
                  />
                </div>
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={handleSaveContent}
                    variant="primary"
                  >
                    Zapisz zmiany
                  </Button>
                </div>
              </div>
            </div>

            {/* Slides Management Section */}
            <section className="mt-12 bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-6">Zarządzanie slajdami</h2>
              
              {/* Add Slide Form */}
              <form onSubmit={addSlide} className="mb-8 space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Tytuł
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                    URL obrazu (1920x1080px lub 1920x960px)
                  </label>
                  <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Zalecane wymiary obrazu: szerokość do 1920px, wysokość do 1080px lub 960px. Obraz zostanie dopasowany z zachowaniem proporcji.
                  </p>
                </div>
                <div>
                  <label htmlFor="link_url" className="block text-sm font-medium text-gray-700 mb-1">
                    URL linku
                  </label>
                  <input
                    type="url"
                    id="link_url"
                    name="link_url"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="overlay_heading" className="block text-sm font-medium text-gray-700 mb-1">
                    Nagłówek nakładki
                  </label>
                  <input
                    type="text"
                    id="overlay_heading"
                    name="overlay_heading"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="overlay_description" className="block text-sm font-medium text-gray-700 mb-1">
                    Opis nakładki
                  </label>
                  <textarea
                    id="overlay_description"
                    name="overlay_description"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="button_text" className="block text-sm font-medium text-gray-700 mb-1">
                    Tekst przycisku
                  </label>
                  <input
                    type="text"
                    id="button_text"
                    name="button_text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="button_url" className="block text-sm font-medium text-gray-700 mb-1">
                    URL przycisku
                  </label>
                  <input
                    type="url"
                    id="button_url"
                    name="button_url"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="overlay_image_url" className="block text-sm font-medium text-gray-700 mb-1">
                    URL obrazu nakładki
                  </label>
                  <input
                    type="url"
                    id="overlay_image_url"
                    name="overlay_image_url"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Zalecane wymiary obrazu: szerokość do 800px, wysokość do 268px. Obraz zostanie dopasowany z zachowaniem proporcji.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Dodaj slajd</Button>
                </div>
              </form>

              {/* Slides List */}
              <DragDropContext onDragEnd={handleSlideReorder}>
                <Droppable droppableId="slides">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {slides.map((slide, index) => (
                        <Draggable key={slide.id} draggableId={String(slide.id)} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-gray-50 p-4 rounded-lg flex items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-4">
                                <img
                                  src={slide.image_url}
                                  alt={slide.title}
                                  className="w-32 h-20 object-cover rounded"
                                />
                                <div>
                                  <h3 className="font-medium">{slide.title}</h3>
                                  <p className="text-sm text-gray-500">{slide.link_url}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button type="button" onClick={() => setEditingSlide(slide)} variant="secondary" size="sm">
                                  Edit
                                </Button>
                                <Button type="button" onClick={() => deleteSlide(slide.id)} variant="danger" size="sm">
                                  Delete
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </section>

            {/* Partners Management Section */}
            <section className="mt-12 bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-6">Zarządzanie partnerami</h2>
              
              {/* Add Partner Form */}
              <form onSubmit={addPartner} className="mb-8 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nazwa
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
                    URL logo (200x64px dla głównych, 150x48px dla technologicznych)
                  </label>
                  <input
                    type="url"
                    id="logo_url"
                    name="logo_url"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-1">
                    URL strony
                  </label>
                  <input
                    type="url"
                    id="website_url"
                    name="website_url"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typ partnera
                  </label>
                  <div className="space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="is_main_partner"
                        value="true"
                        required
                        className="form-radio"
                      />
                      <span className="ml-2">Partner główny</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="is_main_partner"
                        value="false"
                        required
                        className="form-radio"
                      />
                      <span className="ml-2">Partner technologiczny</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Dodaj partnera</Button>
                </div>
              </form>

              {/* Main Partners List */}
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4">Partnerzy główni</h3>
                <DragDropContext onDragEnd={(result) => handlePartnerReorder(result, true)}>
                  <Droppable droppableId="main-partners">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {mainPartners.map((partner, index) => (
                          <Draggable key={partner.id} draggableId={String(partner.id)} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-gray-50 p-4 rounded-lg flex items-center justify-between gap-4"
                              >
                                <div className="flex items-center gap-4">
                                  <img
                                    src={partner.logo_url}
                                    alt={partner.name}
                                    className="h-12 object-contain"
                                  />
                                  <div>
                                    <h4 className="font-medium">{partner.name}</h4>
                                    <p className="text-sm text-gray-500">{partner.website_url}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button type="button" onClick={() => setEditingPartner(partner)} variant="secondary" size="sm">
                                    Edit
                                  </Button>
                                  <Button type="button" onClick={() => deletePartner(partner.id)} variant="danger" size="sm">
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              {/* Technology Partners List */}
              <div>
                <h3 className="text-xl font-medium mb-4">Partnerzy technologiczni</h3>
                <DragDropContext onDragEnd={(result) => handlePartnerReorder(result, false)}>
                  <Droppable droppableId="tech-partners">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {techPartners.map((partner, index) => (
                          <Draggable key={partner.id} draggableId={String(partner.id)} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-gray-50 p-4 rounded-lg flex items-center justify-between gap-4"
                              >
                                <div className="flex items-center gap-4">
                                  <img
                                    src={partner.logo_url}
                                    alt={partner.name}
                                    className="h-12 object-contain"
                                  />
                                  <div>
                                    <h4 className="font-medium">{partner.name}</h4>
                                    <p className="text-sm text-gray-500">{partner.website_url}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button type="button" onClick={() => setEditingPartner(partner)} variant="secondary" size="sm">
                                    Edit
                                  </Button>
                                  <Button type="button" onClick={() => deletePartner(partner.id)} variant="danger" size="sm">
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </section>

            {/* FAQ Management Section */}
            <section className="mt-12 bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="w-8 h-8 text-[#0066CC]" />
                <h2 className="text-2xl font-semibold">Zarządzanie FAQ</h2>
              </div>
              
              {/* Add FAQ Form */}
              <form onSubmit={addFaqItem} className="mb-8 space-y-4">
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                    Pytanie
                  </label>
                  <input
                    type="text"
                    id="question"
                    name="question"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
                    Odpowiedź
                  </label>
                  <Editor
                    id="faq-answer-editor"
                    apiKey="nr4bkkr4ubtgu4fo46groor1yc0xfek3okk7emvcletrsluo"
                    init={{
                      height: 300,
                      menubar: true,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'help', 'wordcount'
                      ],
                      toolbar: 'undo redo | blocks | ' +
                        'bold italic forecolor | alignleft aligncenter ' +
                        'alignright alignjustify | bullist numlist outdent indent | ' +
                        'removeformat | help',
                      content_style: `
                        body { 
                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                          font-size: 16px;
                          color: #333;
                          background: #fff;
                          margin: 1rem;
                        }
                      `,
                      language: 'pl',
                      language_url: '/tinymce/langs/pl.js',
                      browser_spellcheck: true,
                      convert_urls: false,
                      relative_urls: false,
                      remove_script_host: false,
                      entity_encoding: 'raw',
                      verify_html: false,
                      cleanup: false,
                      valid_elements: '*[*]'
                    }}
                    onEditorChange={(content) => {
                      const answerInput = document.getElementById('answer') as HTMLInputElement;
                      if (answerInput) {
                        answerInput.value = content;
                      }
                    }}
                  />
                  <input type="hidden" id="answer" name="answer" required />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Dodaj pytanie FAQ</Button>
                </div>
              </form>

              {/* FAQ List */}
              <DragDropContext onDragEnd={handleFaqReorder}>
                <Droppable droppableId="faq-list">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {faqItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-gray-50 p-4 rounded-lg flex items-center justify-between gap-4"
                            >
                              <div className="flex-1">
                                <div className="text-lg font-bold text-[#1d1d1f] mb-2">
                                  {item.question}
                                </div>
                                <div 
                                  className="text-[15px] leading-relaxed text-[#1d1d1f] bg-[#F5F5F7]/50 p-4 rounded"
                                  dangerouslySetInnerHTML={{ __html: item.answer }}
                                />
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Button type="button" onClick={() => setEditingFaq(item)} variant="secondary" size="sm">
                                  Edit
                                </Button>
                                <Button type="button" onClick={() => deleteFaqItem(item.id)} variant="danger" size="sm">
                                  Delete
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </section>
          </>
        )}
      </div>

      {/* Edit Slide Modal */}
      <Modal
        isOpen={!!editingSlide}
        onClose={() => setEditingSlide(null)}
        title="Edytuj slajd"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={updateSlide} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title-modal" className="block text-sm font-medium text-gray-700 mb-1">
                Tytuł
              </label>
              <input
                type="text"
                id="title-modal"
                name="title"
                defaultValue={editingSlide?.title || ''}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="image_url-modal" className="block text-sm font-medium text-gray-700 mb-1">
                URL obrazu (1920x1080px lub 1920x960px)
              </label>
              <input
                type="url"
                id="image_url-modal"
                name="image_url"
                defaultValue={editingSlide?.image_url || ''}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Zalecane wymiary obrazu: szerokość do 1920px, wysokość do 1080px lub 960px. Obraz zostanie dopasowany z zachowaniem proporcji.
              </p>
            </div>
            <div>
              <label htmlFor="link_url-modal" className="block text-sm font-medium text-gray-700 mb-1">
                URL linku
              </label>
              <input
                type="url"
                id="link_url-modal"
                name="link_url"
                defaultValue={editingSlide?.link_url || ''}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="button_text-modal" className="block text-sm font-medium text-gray-700 mb-1">
                Tekst przycisku
              </label>
              <input
                type="text"
                id="button_text-modal"
                name="button_text"
                defaultValue={editingSlide?.button_text || ''}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="button_url-modal" className="block text-sm font-medium text-gray-700 mb-1">
                URL przycisku
              </label>
              <input
                type="url"
                id="button_url-modal"
                name="button_url"
                defaultValue={editingSlide?.button_url || ''}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="overlay_heading-modal" className="block text-sm font-medium text-gray-700 mb-1">
              Nagłówek nakładki
            </label>
            <input
              type="text"
              id="overlay_heading-modal"
              name="overlay_heading"
              defaultValue={editingSlide?.overlay_heading || ''}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="overlay_description-modal" className="block text-sm font-medium text-gray-700 mb-1">
              Opis nakładki
            </label>
            <textarea
              id="overlay_description-modal"
              name="overlay_description"
              defaultValue={editingSlide?.overlay_description || ''}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="overlay_image_url-modal" className="block text-sm font-medium text-gray-700 mb-1">
              URL obrazu nakładki
            </label>
            <input
              type="url"
              id="overlay_image_url-modal"
              name="overlay_image_url"
              defaultValue={editingSlide?.overlay_image_url || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Zalecane wymiary obrazu: szerokość do 800px, wysokość do 268px. Obraz zostanie dopasowany z zachowaniem proporcji.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditingSlide(null)}>
              Anuluj
            </Button>
            <Button type="submit">
              Zapisz zmiany
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit FAQ Modal */}
      <Modal
        isOpen={!!editingFaq}
        onClose={() => setEditingFaq(null)}
        title="Edytuj pytanie FAQ"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={updateFaqItem} className="space-y-4">
          <div>
            <label htmlFor="question-modal" className="block text-sm font-medium text-gray-700 mb-1">
              Pytanie
            </label>
            <input
              type="text"
              id="question-modal"
              name="question"
              defaultValue={editingFaq?.question || ''}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="answer-modal" className="block text-sm font-medium text-gray-700 mb-1">
              Odpowiedź
            </label>
            <Editor
              id="answer-modal"
              apiKey="nr4bkkr4ubtgu4fo46groor1yc0xfek3okk7emvcletrsluo"
              initialValue={editingFaq?.answer || ''}
              init={{
                height: 400,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
                content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; font-size: 14px; }',
                language: 'pl',
                language_url: '/tinymce/langs/pl.js'
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditingFaq(null)}>
              Anuluj
            </Button>
            <Button type="submit">
              Zapisz zmiany
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Partner Modal */}
      <Modal
        isOpen={!!editingPartner}
        onClose={() => setEditingPartner(null)}
        title="Edytuj partnera"
      >
        <form onSubmit={updatePartner} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nazwa
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={editingPartner?.name}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
              URL logo (200x64px dla głównych, 150x48px dla technologicznych)
            </label>
            <input
              type="url"
              id="logo_url"
              name="logo_url"
              defaultValue={editingPartner?.logo_url}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-1">
              URL strony
            </label>
            <input
              type="url"
              id="website_url"
              name="website_url"
              defaultValue={editingPartner?.website_url}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={() => setEditingPartner(null)} variant="secondary">
              Anuluj
            </Button>
            <Button type="submit">
              Zapisz zmiany
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
