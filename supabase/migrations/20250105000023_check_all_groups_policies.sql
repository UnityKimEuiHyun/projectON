-- Check and summarize all RLS policies for groups table
-- Migration: 20250105000023_check_all_groups_policies

-- Check current RLS policies for groups table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'groups'
ORDER BY policyname;

-- Check if RLS is enabled for groups table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'groups';

-- Summary of what policies should exist:
-- 1. "All authenticated users can view groups" - FOR SELECT
-- 2. "All authenticated users can create groups" - FOR INSERT  
-- 3. "Group creators can manage groups" - FOR UPDATE
-- 4. "Group creators can delete empty groups" - FOR DELETE
