-- Check and fix RLS policies for group_members table
-- Migration: 20250105000018_check_group_members_rls_policies

-- First, check current RLS policies
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
WHERE tablename = 'group_members'
ORDER BY policyname;

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'group_members';

-- Add INSERT policy for group admins
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;

CREATE POLICY "Group admins can add members" ON public.group_members
FOR INSERT 
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
        AND gm.role = 'admin'
    )
);

-- Add INSERT policy for group creators (if they don't have admin role yet)
DROP POLICY IF EXISTS "Group creators can add members" ON public.group_members;

CREATE POLICY "Group creators can add members" ON public.group_members
FOR INSERT 
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.groups g
        WHERE g.id = group_members.group_id
        AND g.created_by = auth.uid()
    )
);

-- Verify the new policies
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
WHERE tablename = 'group_members'
ORDER BY policyname;
