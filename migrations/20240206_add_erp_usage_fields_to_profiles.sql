-- Add new boolean fields to profiles table for ERP usage information
ALTER TABLE profiles
ADD COLUMN czy_korzysta_z_erp boolean DEFAULT NULL,
ADD COLUMN czy_zamierza_wdrozyc_erp boolean DEFAULT NULL,
ADD COLUMN czy_dokonal_wyboru_erp boolean DEFAULT NULL,
ADD COLUMN updated_at timestamptz DEFAULT CURRENT_TIMESTAMP;

-- Add comments to the columns for better documentation
COMMENT ON COLUMN profiles.czy_korzysta_z_erp IS 'Czy korzystasz z systemu ERP?';
COMMENT ON COLUMN profiles.czy_zamierza_wdrozyc_erp IS 'Czy zamierzasz wdrożyć system ERP?';
COMMENT ON COLUMN profiles.czy_dokonal_wyboru_erp IS 'Czy dokonałeś już wyboru nowego systemu ERP?';
COMMENT ON COLUMN profiles.updated_at IS 'Last update timestamp';
