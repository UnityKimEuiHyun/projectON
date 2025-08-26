-- Add INSERT policy for groups table
-- Migration: 20250105000022_add_insert_policy_for_groups

-- Add INSERT policy for all authenticated users to create groups
DROP POLICY IF EXISTS "All authenticated users can create groups" ON public.groups;

CREATE POLICY "All authenticated users can create groups" ON public.groups
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Verify the new policy
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
