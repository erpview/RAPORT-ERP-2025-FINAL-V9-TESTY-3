import React from 'react';
import { SEOData } from '../../types/seo';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { JsonInput } from '../ui/JsonInput';

interface SEOFormProps {
  data: Partial<SEOData>;
  onChange: (data: Partial<SEOData>) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  isDynamic?: boolean;
}

export const SEOForm: React.FC<SEOFormProps> = ({
  data,
  onChange,
  onSubmit,
  isLoading = false,
  isDynamic = false,
}) => {
  const handleChange = (field: keyof SEOData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Podstawowe meta tagi</h3>
        <div className="space-y-4">
          <Input
            label="Tytuł strony"
            value={data.title_template || ''}
            onChange={(e) => handleChange('title_template', e.target.value)}
            placeholder={isDynamic ? 'np. {term_name} - Słownik ERP' : 'np. Raport ERP'}
            required
          />
          <TextArea
            label="Opis strony"
            value={data.description_template || ''}
            onChange={(e) => handleChange('description_template', e.target.value)}
            placeholder={isDynamic ? 'np. Dowiedz się więcej o {term_name}. {short_description}' : 'Opis strony...'}
            required
          />
          <Input
            label="Słowa kluczowe"
            value={data.keywords_template || ''}
            onChange={(e) => handleChange('keywords_template', e.target.value)}
            placeholder="słowo1, słowo2, słowo3"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Open Graph</h3>
        <div className="space-y-4">
          <Input
            label="OG Tytuł"
            value={data.og_title_template || ''}
            onChange={(e) => handleChange('og_title_template', e.target.value)}
            placeholder={isDynamic ? '{term_name} | Raport ERP' : 'Tytuł dla social media'}
          />
          <TextArea
            label="OG Opis"
            value={data.og_description_template || ''}
            onChange={(e) => handleChange('og_description_template', e.target.value)}
            placeholder="Opis dla social media"
          />
          {isDynamic && (
            <Input
              label="Pole obrazka OG"
              value={data.og_image_field || ''}
              onChange={(e) => handleChange('og_image_field', e.target.value)}
              placeholder="np. image_url"
            />
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Structured Data (JSON-LD)</h3>
        <div className="space-y-4">
          <JsonInput
            label="Szablon Structured Data"
            value={data.structured_data_template || {}}
            onChange={(value) => handleChange('structured_data_template', value)}
            placeholder={isDynamic ? {
              "@context": "https://schema.org",
              "@type": "DefinedTerm",
              "name": "{term_name}",
              "description": "{description}"
            } : {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Nazwa strony",
              "description": "Opis strony"
            }}
          />
        </div>
      </Card>

      {isDynamic && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ustawienia dynamiczne</h3>
          <div className="space-y-4">
            <Input
              label="Pole dynamiczne"
              value={data.dynamic_field || ''}
              onChange={(e) => handleChange('dynamic_field', e.target.value)}
              placeholder="np. term_name"
              required
            />
            <Input
              label="Strona nadrzędna"
              value={data.parent_page || ''}
              onChange={(e) => handleChange('parent_page', e.target.value)}
              placeholder="np. dictionary"
              required
            />
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Dodatkowe ustawienia</h3>
        <div className="space-y-4">
          <Input
            label="Canonical URL"
            value={data.canonical_url_template || ''}
            onChange={(e) => handleChange('canonical_url_template', e.target.value)}
            placeholder={isDynamic ? 'https://example.com/slownik/{slug}' : 'https://example.com/page'}
          />
          <Input
            label="Robots"
            value={data.robots || ''}
            onChange={(e) => handleChange('robots', e.target.value)}
            placeholder="index, follow"
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </Button>
      </div>
    </form>
  );
};
