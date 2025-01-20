-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create company_modules table
CREATE TABLE IF NOT EXISTS company_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description TEXT,
    order_index INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create company_fields table
CREATE TABLE IF NOT EXISTS company_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES company_modules(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    field_key VARCHAR NOT NULL,
    field_type VARCHAR NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    options JSONB,
    order_index INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(module_id, field_key)
);

-- Create company_field_values table
CREATE TABLE IF NOT EXISTS company_field_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    field_id UUID REFERENCES company_fields(id) ON DELETE CASCADE,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, field_id)
);

-- Add RLS policies
ALTER TABLE company_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_field_values ENABLE ROW LEVEL SECURITY;

-- Policies for company_modules
CREATE POLICY "company_modules_read_policy" ON company_modules
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "company_modules_admin_policy" ON company_modules
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_management
            WHERE user_id = auth.uid()
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Policies for company_fields
CREATE POLICY "company_fields_read_policy" ON company_fields
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "company_fields_admin_policy" ON company_fields
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_management
            WHERE user_id = auth.uid()
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Policies for company_field_values
CREATE POLICY "company_field_values_read_policy" ON company_field_values
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "company_field_values_admin_policy" ON company_field_values
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_management
            WHERE user_id = auth.uid()
            AND role = 'admin'
            AND is_active = true
        )
    );

CREATE POLICY "company_field_values_editor_policy" ON company_field_values
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM companies
            WHERE companies.id = company_field_values.company_id
            AND companies.created_by = auth.uid()
        )
    );

-- Insert default modules
INSERT INTO company_modules (name, description, order_index) VALUES
('Informacje podstawowe', 'Podstawowe informacje o firmie', 1),
('Kontakt', 'Dane kontaktowe firmy', 2),
('Lokalizacja', 'Informacje o lokalizacji firmy', 3),
('Social Media', 'Linki do mediów społecznościowych', 4),
('Certyfikaty', 'Certyfikaty i uprawnienia firmy', 5);

-- Insert default fields for basic information module
WITH basic_module AS (
    SELECT id FROM company_modules WHERE name = 'Informacje podstawowe' LIMIT 1
)
INSERT INTO company_fields (module_id, name, field_key, field_type, description, is_required, order_index) VALUES
((SELECT id FROM basic_module), 'Nazwa firmy', 'name', 'text', 'Pełna nazwa firmy', true, 1),
((SELECT id FROM basic_module), 'NIP', 'nip', 'text', 'Numer NIP firmy', true, 2),
((SELECT id FROM basic_module), 'REGON', 'regon', 'text', 'Numer REGON firmy', false, 3),
((SELECT id FROM basic_module), 'KRS', 'krs', 'text', 'Numer KRS firmy', false, 4),
((SELECT id FROM basic_module), 'Rok założenia', 'founded_year', 'number', 'Rok założenia firmy', false, 5),
((SELECT id FROM basic_module), 'Liczba pracowników', 'employees_count', 'number', 'Aktualna liczba pracowników', false, 6);

-- Insert default fields for contact module
WITH contact_module AS (
    SELECT id FROM company_modules WHERE name = 'Kontakt' LIMIT 1
)
INSERT INTO company_fields (module_id, name, field_key, field_type, description, is_required, order_index) VALUES
((SELECT id FROM contact_module), 'Email', 'email', 'email', 'Główny adres email', true, 1),
((SELECT id FROM contact_module), 'Telefon', 'phone', 'text', 'Główny numer telefonu', true, 2),
((SELECT id FROM contact_module), 'Strona WWW', 'website', 'url', 'Adres strony internetowej', false, 3);

-- Insert default fields for location module
WITH location_module AS (
    SELECT id FROM company_modules WHERE name = 'Lokalizacja' LIMIT 1
)
INSERT INTO company_fields (module_id, name, field_key, field_type, description, is_required, order_index) VALUES
((SELECT id FROM location_module), 'Ulica', 'street', 'text', 'Nazwa ulicy i numer', true, 1),
((SELECT id FROM location_module), 'Kod pocztowy', 'postal_code', 'text', 'Kod pocztowy', true, 2),
((SELECT id FROM location_module), 'Miasto', 'city', 'text', 'Nazwa miasta', true, 3),
((SELECT id FROM location_module), 'Województwo', 'state', 'text', 'Nazwa województwa', true, 4),
((SELECT id FROM location_module), 'Kraj', 'country', 'text', 'Nazwa kraju', true, 5);
