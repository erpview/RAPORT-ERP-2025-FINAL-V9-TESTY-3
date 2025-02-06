-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 
                  FROM information_schema.columns 
                  WHERE table_name='profiles' 
                  AND column_name='updated_at') 
    THEN
        ALTER TABLE profiles
        ADD COLUMN updated_at timestamptz DEFAULT CURRENT_TIMESTAMP;
        
        COMMENT ON COLUMN profiles.updated_at IS 'Last update timestamp';
    END IF;
END $$;
