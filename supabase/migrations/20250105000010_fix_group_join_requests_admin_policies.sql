-- Fix group_join_requests RLS policies to allow group admins (not just creators) to view requests
-- Migration: 20250105000010_fix_group_join_requests_admin_policies

-- Drop existing admin policies that only check groups.created_by
DROP POLICY IF EXISTS "Group admins can view requests for their groups" ON public.group_join_requests;
DROP POLICY IF EXISTS "Group admins can update requests for their groups" ON public.group_join_requests;

-- Create new policies that check group_members.role = 'admin' and status = 'active'
CREATE POLICY "Group admins can view requests for their groups" ON public.group_join_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = group_join_requests.group_id 
            AND user_id = auth.uid() 
            AND role = 'admin' 
            AND status = 'active'
        )
    );

CREATE POLICY "Group admins can update requests for their groups" ON public.group_join_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = group_join_requests.group_id 
            AND user_id = auth.uid() 
            AND role = 'admin' 
            AND status = 'active'
        )
    );

-- Add comment for documentation
COMMENT ON POLICY "Group admins can view requests for their groups" ON public.group_join_requests 
IS '그룹의 admin 역할을 가진 사용자가 해당 그룹의 가입 요청을 볼 수 있음';

COMMENT ON POLICY "Group admins can update requests for their groups" ON public.group_join_requests 
IS '그룹의 admin 역할을 가진 사용자가 해당 그룹의 가입 요청을 승인/거절할 수 있음';

-- Verify the new policies are created
-- This will show the updated policies after migration
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'group_join_requests'
ORDER BY policyname;
