-- Function to generate a slug from term
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(
                    unaccent(input_text),  -- Remove accents
                    '[^a-zA-Z0-9\s-]', '', 'g'  -- Remove special characters
                ),
                '\s+', '-', 'g'  -- Replace spaces with hyphens
            ),
            '-+', '-', 'g'  -- Replace multiple hyphens with single hyphen
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to extract first letter
CREATE OR REPLACE FUNCTION get_first_letter(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN upper(left(unaccent(input_text), 1));
END;
$$ LANGUAGE plpgsql;

-- Create a temporary table to hold the CSV data
CREATE TEMP TABLE temp_terms (
    term TEXT,
    definition TEXT,
    tags TEXT,
    related_terms TEXT
);

-- Copy data from CSV file
-- Note: Replace '/path/to/your/terms.csv' with the actual path to your CSV file
\COPY temp_terms(term, definition, tags, related_terms) FROM '/path/to/your/terms.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', QUOTE '"');

-- Insert data into slownik_erp_terms
INSERT INTO slownik_erp_terms (
    term,
    definition,
    slug,
    letter,
    tags,
    related_terms,
    created_at,
    updated_at
)
SELECT 
    term,
    definition,
    generate_slug(term) as slug,
    get_first_letter(term) as letter,
    string_to_array(tags, ';') as tags,
    string_to_array(related_terms, ';') as related_terms,
    NOW() as created_at,
    NOW() as updated_at
FROM temp_terms
ON CONFLICT (slug) DO UPDATE
SET 
    term = EXCLUDED.term,
    definition = EXCLUDED.definition,
    tags = EXCLUDED.tags,
    related_terms = EXCLUDED.related_terms,
    updated_at = NOW();

-- Drop temporary table
DROP TABLE temp_terms;
