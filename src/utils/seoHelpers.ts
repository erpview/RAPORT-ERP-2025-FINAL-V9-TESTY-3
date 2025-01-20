interface Partner {
  id: number;
  name: string;
  logo_url: string;
  website_url: string;
  slug: string;
  partner_page?: {
    description: string;
  }[] | null;
}

export const formatPartnersForSEO = (partners: Partner[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": partners.map((partner, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Organization",
        "name": partner.name,
        "description": partner.partner_page?.[0]?.description || '',
        "url": `https://raport-erp.pl/partnerzy/${partner.slug}`,
        "logo": partner.logo_url,
        "sameAs": partner.website_url
      }
    }))
  };
};
