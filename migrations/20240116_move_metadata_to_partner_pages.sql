-- Step 1: Add new columns to partner_pages table
ALTER TABLE partner_pages
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT;

-- Step 2: Copy data from partners to partner_pages
-- First, ensure each partner has a partner_page record
INSERT INTO partner_pages (partner_id, content, published, description, meta_title, meta_description, meta_keywords)
SELECT 
    p.id as partner_id,
    COALESCE((SELECT content FROM partner_pages WHERE partner_id = p.id), '') as content,
    COALESCE((SELECT published FROM partner_pages WHERE partner_id = p.id), true) as published,
    p.description,
    p.meta_title,
    p.meta_description,
    p.meta_keywords
FROM partners p
WHERE NOT EXISTS (
    SELECT 1 FROM partner_pages pp WHERE pp.partner_id = p.id
);

-- For existing partner_pages records, update with metadata from partners
UPDATE partner_pages pp
SET 
    description = p.description,
    meta_title = p.meta_title,
    meta_description = p.meta_description,
    meta_keywords = p.meta_keywords
FROM partners p
WHERE pp.partner_id = p.id;

-- Step 3: Remove columns from partners table
ALTER TABLE partners
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS meta_title,
DROP COLUMN IF EXISTS meta_description,
DROP COLUMN IF EXISTS meta_keywords;
