-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create system_modules table
CREATE TABLE IF NOT EXISTS system_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    description TEXT,
    order_index INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system_fields table
CREATE TABLE IF NOT EXISTS system_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES system_modules(id) ON DELETE CASCADE,
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

-- Create system_field_values table
CREATE TABLE IF NOT EXISTS system_field_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id UUID REFERENCES systems(id) ON DELETE CASCADE,
    field_id UUID REFERENCES system_fields(id) ON DELETE CASCADE,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(system_id, field_id)
);

-- Add RLS policies
ALTER TABLE system_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_field_values ENABLE ROW LEVEL SECURITY;

-- Policies for system_modules
CREATE POLICY "Allow read access to all authenticated users" ON system_modules
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow full access to admin users" ON system_modules
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_management
            WHERE user_id = auth.uid()
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Policies for system_fields
CREATE POLICY "Allow read access to all authenticated users" ON system_fields
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow full access to admin users" ON system_fields
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_management
            WHERE user_id = auth.uid()
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Policies for system_field_values
CREATE POLICY "Allow read access to all authenticated users" ON system_field_values
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow full access to admin users" ON system_field_values
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_management
            WHERE user_id = auth.uid()
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Insert default Basic Information module
INSERT INTO system_modules (name, description, order_index)
VALUES (
    'Basic Information',
    'Core information about the system',
    1
);

-- Get the module ID
DO $$ 
DECLARE
    module_id UUID;
BEGIN
    SELECT id INTO module_id FROM system_modules WHERE name = 'Basic Information';

    -- Insert default fields
    INSERT INTO system_fields (module_id, name, field_key, field_type, description, is_required, options, order_index)
    VALUES
    (module_id, 'System Name', 'system_name', 'text', 'Name of the ERP system', true, null, 1),
    (module_id, 'Supplier', 'supplier', 'text', 'System supplier/vendor name', true, null, 2),
    (module_id, 'Website', 'website', 'text', 'Official website URL', true, null, 3),
    (module_id, 'Company Size', 'company_size', 'select', 'Target company size', true, '["Small", "Medium", "Large", "Enterprise"]'::jsonb, 4),
    (module_id, 'Description', 'description', 'textarea', 'Detailed system description', true, null, 5);
END $$;
