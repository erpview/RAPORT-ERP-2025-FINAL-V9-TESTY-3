-- Add display_on_all column to slownik_erp_banners
ALTER TABLE slownik_erp_banners 
ADD COLUMN IF NOT EXISTS display_on_all BOOLEAN DEFAULT false;

-- Update RLS policies
DROP POLICY IF EXISTS "slownik_erp_banners_public_read" ON slownik_erp_banners;
DROP POLICY IF EXISTS "slownik_erp_banners_admin_all" ON slownik_erp_banners;

CREATE POLICY "slownik_erp_banners_public_read"
  ON slownik_erp_banners FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "slownik_erp_banners_admin_all"
  ON slownik_erp_banners FOR ALL
  TO authenticated
  USING (auth.is_admin(auth.uid()))
  WITH CHECK (auth.is_admin(auth.uid()));
