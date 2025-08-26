-- Add SELECT policy for group_members table
-- Migration: 20250105000019_add_select_policy_for_group_members

-- Add SELECT policy for all authenticated users to view group members
DROP POLICY IF EXISTS "All authenticated users can view group members" ON public.group_members;

CREATE POLICY "All authenticated users can view group members" ON public.group_members
FOR SELECT 
TO authenticated
USING (true);

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
WHERE tablename = 'group_members'
ORDER BY policyname;
