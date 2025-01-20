import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dictionaryService } from '../services/dictionary';
import { DictionaryTerm, DictionaryBanner } from '../types/dictionary';
import { Button } from '../components/ui/Button';
import { ChevronLeft } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';

// Helper function to strip HTML tags and truncate text
const stripHtmlAndTruncate = (html: string, maxLength: number = 160): string => {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, '');
  // Replace multiple spaces, newlines with single space
  const cleanText = text.replace(/\s+/g, ' ').trim();
  // Truncate and add ellipsis if needed
  return cleanText.length > maxLength 
    ? cleanText.substring(0, maxLength - 3) + '...'
    : cleanText;
};

const SlownikErpTerm: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [term, setTerm] = useState<DictionaryTerm | null>(null);
  const [banners, setBanners] = useState<DictionaryBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTermData = async () => {
      if (!slug) return;
      
      try {
        const termData = await dictionaryService.getTermBySlug(slug);
        if (termData) {
          setTerm(termData);
          const bannerData = await dictionaryService.getTermBanners(termData.id);
          setBanners(bannerData);
        }
      } catch (error) {
        console.error('Error fetching term data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTermData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!term) {
    return (
      <div className="container mx-auto px-8 sm:px-8 lg:px-12 py-8">
        <h4 className="text-2xl text-center mb-4">
          Nie znaleziono definicji
        </h4>
        <div className="flex justify-center">
          <Button component={Link} to="/slownik-erp" variant="primary">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Powrót do słownika
          </Button>
        </div>
      </div>
    );
  }

  const plainTextDescription = stripHtmlAndTruncate(term.explanation);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        pageIdentifier="dictionary-term"
        dynamicData={{
          term: term.term,
          definition: plainTextDescription,
          slug: slug,
          letter: term.letter
        }}
      />
      <div className="container mx-auto px-8 sm:px-8 lg:px-12 py-8">
        <div className="flex justify-end mb-6">
          <Button component={Link} to="/slownik-erp" variant="ghost">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Powrót do słownika
          </Button>
        </div>

        <h1 className="text-[2.75rem] font-bold text-[#2c3b67] mb-6">
          {term.term}
        </h1>

        <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: term.explanation }} />

        {banners.length > 0 && (
          <div className="space-y-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="w-full"
              >
                {banner.link_url ? (
                  <a
                    href={banner.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={banner.image_url}
                      alt={`Banner for ${term.term}`}
                      className="w-full rounded"
                    />
                  </a>
                ) : (
                  <img
                    src={banner.image_url}
                    alt={`Banner for ${term.term}`}
                    className="w-full rounded"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SlownikErpTerm;
