-- Add SELECT policy for profiles table
-- Migration: 20250105000020_add_select_policy_for_profiles

-- Add SELECT policy for all authenticated users to view profiles
DROP POLICY IF EXISTS "All authenticated users can view profiles" ON public.profiles;

CREATE POLICY "All authenticated users can view profiles" ON public.profiles
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
WHERE tablename = 'profiles'
ORDER BY policyname;
