import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { PartnerCard } from '../../components/partners/PartnerCard';
import { MetaTags } from '../../components/MetaTags';
import { Helmet } from 'react-helmet-async';

interface Partner {
  id: number;
  name: string;
  logo_url: string;
  website_url: string;
  is_main_partner: boolean;
  slug: string;
  order_index: number;
  partner_pages: {
    description: string;
  }[] | null;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase
          .from('partners')
          .select(`
            *,
            partner_pages (
              description
            )
          `)
          .order('order_index', { ascending: true });

        if (error) throw error;

        setPartners(data || []);
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const mainPartners = partners.filter(partner => partner.is_main_partner);
  const otherPartners = partners.filter(partner => !partner.is_main_partner);

  const seoData = {
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": partners.map((partner, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Organization",
            "name": partner.name,
            "url": `https://raport-erp-2025.netlify.app/partnerzy/${partner.slug}`
          }
        }))
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-600">Wczytywanie...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="MobileOptimized" content="width" />
      </Helmet>
      
      <MetaTags />
      <div className="min-h-screen bg-[#F5F5F7] py-12">
        <div className="container mx-auto px-4 py-8">
          {/* Main Partners Section */}
          {mainPartners.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Partnerzy główni</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mainPartners.map((partner) => (
                  <PartnerCard
                    key={partner.id}
                    name={partner.name}
                    logo_url={partner.logo_url}
                    slug={partner.slug}
                    website_url={partner.website_url}
                    description={partner.partner_pages?.[0]?.description}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Technical Partners Section */}
          {otherPartners.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-6">Partnerzy technologiczni</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherPartners.map((partner) => (
                  <PartnerCard
                    key={partner.id}
                    name={partner.name}
                    logo_url={partner.logo_url}
                    slug={partner.slug}
                    website_url={partner.website_url}
                    description={partner.partner_pages?.[0]?.description}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
