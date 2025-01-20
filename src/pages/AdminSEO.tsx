import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { SEOData } from '../types/seo';
import { SEOForm } from '../components/seo/SEOForm';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { toast } from 'react-hot-toast';

const AdminSEO: React.FC = () => {
  const [seoTemplates, setSeoTemplates] = useState<SEOData[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SEOData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSEOTemplates();
  }, []);

  const loadSEOTemplates = async () => {
    const { data, error } = await supabase
      .from('page_seo')
      .select('*')
      .order('page_identifier');

    if (error) {
      toast.error('Błąd podczas ładowania szablonów SEO');
      return;
    }

    setSeoTemplates(data || []);
  };

  const handleTemplateSelect = (template: SEOData) => {
    setSelectedTemplate(template);
  };

  const handleTemplateChange = (changes: Partial<SEOData>) => {
    if (!selectedTemplate) return;
    setSelectedTemplate({ ...selectedTemplate, ...changes });
  };

  const handleSubmit = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    const { error } = await supabase
      .from('page_seo')
      .update({
        title_template: selectedTemplate.title_template,
        description_template: selectedTemplate.description_template,
        keywords_template: selectedTemplate.keywords_template,
        canonical_url_template: selectedTemplate.canonical_url_template,
        og_title_template: selectedTemplate.og_title_template,
        og_description_template: selectedTemplate.og_description_template,
        og_image_field: selectedTemplate.og_image_field,
        structured_data_template: selectedTemplate.structured_data_template,
        robots: selectedTemplate.robots,
        dynamic_field: selectedTemplate.dynamic_field,
        parent_page: selectedTemplate.parent_page,
      })
      .eq('id', selectedTemplate.id);

    setIsLoading(false);

    if (error) {
      toast.error('Błąd podczas zapisywania zmian');
      return;
    }

    toast.success('Zmiany zostały zapisane');
    loadSEOTemplates();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zarządzanie SEO</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Szablony SEO</h2>
            <div className="space-y-2">
              {seoTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate?.id === template.id ? 'primary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => handleTemplateSelect(template)}
                >
                  {template.page_identifier}
                  {template.is_dynamic && ' (dynamiczny)'}
                </Button>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {selectedTemplate ? (
            <SEOForm
              data={selectedTemplate}
              onChange={handleTemplateChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              isDynamic={selectedTemplate.is_dynamic}
            />
          ) : (
            <Card className="p-6">
              <p className="text-center text-gray-500">
                Wybierz szablon SEO z listy po lewej stronie
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSEO;
