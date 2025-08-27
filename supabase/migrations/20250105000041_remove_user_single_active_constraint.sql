-- Remove the unique constraint that prevents users from being active in multiple groups
-- This allows users to be affiliated with multiple companies simultaneously

-- Drop the unique index that enforces single active affiliation per user
DROP INDEX IF EXISTS idx_group_members_user_single_active;

-- Verify the constraint is removed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_group_members_user_single_active'
    ) THEN
        RAISE EXCEPTION 'Index idx_group_members_user_single_active still exists';
    END IF;
    
    RAISE NOTICE 'Successfully removed idx_group_members_user_single_active constraint';
END $$;
