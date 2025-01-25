-- Create an ENUM type for company categories
CREATE TYPE company_category AS ENUM ('Producent', 'Integrator', 'Konsulting IT', 'Szkolenia IT');

-- Add the category column to companies table
ALTER TABLE companies
ADD COLUMN category company_category;

-- Add comment to the column for better documentation
COMMENT ON COLUMN companies.category IS 'Kategoria firmy: Producent, Integrator, Konsulting IT, Szkolenia IT';
