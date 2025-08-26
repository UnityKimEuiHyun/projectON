-- Simple update for group_join_requests table
-- Migration: 20250105000012_simple_update_group_join_requests

-- First, let's check the current table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'group_join_requests' 
ORDER BY ordinal_position;

-- Check if there are any constraints that might prevent updates
SELECT 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'group_join_requests';

-- Check current data to understand the structure
SELECT 
    id,
    group_id,
    user_id,
    status,
    message,
    created_at
FROM group_join_requests 
LIMIT 5;

-- If there are any unique constraints that might cause issues, we can drop them
-- (This is just for checking - don't run unless necessary)
-- SELECT 
--     tc.constraint_name, 
--     tc.constraint_type
-- FROM information_schema.table_constraints AS tc 
-- WHERE tc.table_name = 'group_join_requests' 
-- AND tc.constraint_type = 'UNIQUE';
