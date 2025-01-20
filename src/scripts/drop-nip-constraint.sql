-- Drop the NIP validation constraint
ALTER TABLE companies DROP CONSTRAINT IF EXISTS valid_nip;
