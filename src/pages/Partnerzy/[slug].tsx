import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import VideoPlayer from '../../components/VideoPlayer';
import { useAuth } from '../../context/AuthContext';
import React from 'react';
import { SEOHead } from '../../components/seo/SEOHead';

interface Partner {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
  website_url: string;
  description: string;
}

interface PartnerPage {
  content: string;
  published: boolean;
  pdf_url?: string;
  video_url_1?: string;
  video_url_2?: string;
  form_banner_url?: string;
  form_url?: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

export default function PartnerDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [partnerPage, setPartnerPage] = useState<PartnerPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin, isEditor } = useAuth();

  useEffect(() => {
    const fetchPartnerData = async () => {
      try {
        // Fetch partner details
        const { data: partnerData, error: partnerError } = await supabase
          .from('partners')
          .select('*')
          .eq('slug', slug)
          .single();

        if (partnerError) throw partnerError;
        if (!partnerData) {
          navigate('/404');
          return;
        }

        setPartner(partnerData);

        // Fetch partner page content with metadata
        const { data: pageData, error: pageError } = await supabase
          .from('partner_pages')
          .select('content, published, pdf_url, video_url_1, video_url_2, form_banner_url, form_url, meta_title, meta_description, meta_keywords')
          .eq('partner_id', partnerData.id)
          .eq('published', true)
          .single();

        if (pageError && pageError.code !== 'PGRST116') throw pageError;
        setPartnerPage(pageData);
      } catch (error) {
        console.error('Error fetching partner data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartnerData();
  }, [slug, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!partner) {
    return null;
  }

  const seoData = {
    meta_title: partnerPage?.meta_title,
    meta_description: partnerPage?.meta_description,
    meta_keywords: partnerPage?.meta_keywords,
    name: partner.name,
    description: partner.description,
    logo_url: partner.logo_url,
    slug: partner.slug
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12">
      <SEOHead 
        pageIdentifier="partner"
        dynamicData={seoData}
      />
      
      <div className="max-w-7xl mx-auto px-4">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : partner ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Partner Logo Badge */}
              <div className="bg-white rounded-lg shadow p-6">
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Partner Website Button */}
              {partner?.website_url && (
                <div className="bg-white rounded-lg shadow p-6">
                  <a
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Odwiedź stronę partnera
                  </a>
                </div>
              )}

              {/* PDF Download Button */}
              {(user || isAdmin || isEditor) && partnerPage?.pdf_url && (
                <div className="bg-white rounded-lg shadow p-6 mt-4">
                  <a
                    href={partnerPage.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Pobierz prezentację PDF
                  </a>
                </div>
              )}

              {/* Banner */}
              {partnerPage?.form_banner_url && (
                <div className="bg-white rounded-lg shadow p-6 mt-4">
                  <a
                    href={partnerPage.form_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={partnerPage.form_banner_url}
                      alt="Banner"
                      className="w-full h-auto rounded-md"
                    />
                  </a>
                </div>
              )}
            </div>

            {/* Right Column - Description and Content */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow p-8">
                <h1 className="text-3xl font-bold mb-6">{partner.name}</h1>
                
                {/* Short Description */}
                {partner.description && (
                  <div className="prose max-w-none mb-8">
                    <p className="text-lg text-gray-600">{partner.description}</p>
                  </div>
                )}

                {/* WYSIWYG Content */}
                {partnerPage?.content && (
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: partnerPage.content }} />
                  </div>
                )}
              </div>

              {/* Videos Section - Separated Area */}
              {(partnerPage?.video_url_1 || partnerPage?.video_url_2) && (
                <div className="mt-16 py-16 border-t border-gray-200">
                  <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`grid grid-cols-1 ${partnerPage?.video_url_1 && partnerPage?.video_url_2 ? 'md:grid-cols-2' : ''} gap-16`}>
                      {partnerPage?.video_url_1 && (
                        <div className={`aspect-w-16 aspect-h-9 bg-gray-100 rounded-xl overflow-hidden shadow-2xl transform transition-all duration-300 hover:shadow-3xl ${!partnerPage?.video_url_2 ? 'md:col-span-2 lg:col-span-2' : ''} scale-110`}>
                          <VideoPlayer url={partnerPage.video_url_1} className="w-full h-full" />
                        </div>
                      )}
                      {partnerPage?.video_url_2 && (
                        <div className={`aspect-w-16 aspect-h-9 bg-gray-100 rounded-xl overflow-hidden shadow-2xl transform transition-all duration-300 hover:shadow-3xl ${!partnerPage?.video_url_1 ? 'md:col-span-2 lg:col-span-2' : ''} scale-110`}>
                          <VideoPlayer url={partnerPage.video_url_2} className="w-full h-full" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900">Partner nie został znaleziony</h2>
            <p className="mt-2 text-gray-600">Przepraszamy, ale nie mogliśmy znaleźć szukanego partnera.</p>
          </div>
        )}
      </div>
    </div>
  );
}
