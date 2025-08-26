-- Add updated_at field to group_join_requests table
-- Migration: 20250105000011_add_updated_at_to_group_join_requests

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'group_join_requests' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.group_join_requests 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Create trigger to automatically update updated_at on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS update_group_join_requests_updated_at ON public.group_join_requests;

-- Create trigger
CREATE TRIGGER update_group_join_requests_updated_at
    BEFORE UPDATE ON public.group_join_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON COLUMN public.group_join_requests.updated_at IS '마지막 업데이트 시간';

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'group_join_requests' 
AND column_name IN ('created_at', 'updated_at')
ORDER BY column_name;
