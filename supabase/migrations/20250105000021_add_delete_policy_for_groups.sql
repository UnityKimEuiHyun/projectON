-- Add DELETE policy for groups table
-- Migration: 20250105000021_add_delete_policy_for_groups

-- Add DELETE policy for group creators (only if no members)
DROP POLICY IF EXISTS "Group creators can delete empty groups" ON public.groups;

CREATE POLICY "Group creators can delete empty groups" ON public.groups
FOR DELETE 
TO authenticated
USING (
    created_by = auth.uid() 
    AND NOT EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = groups.id
        AND gm.status = 'active'
    )
);

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
