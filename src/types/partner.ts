export interface Partner {
    id: string;
    name: string;
    slug: string;
    logo_url: string;
    website_url: string;
    description: string;
    is_main_partner: boolean;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    created_at: string;
    updated_at: string;
}

export interface PartnerPage {
    id: string;
    partner_id: string;
    content: string;
    published: boolean;
    created_at: string;
    updated_at: string;
}
