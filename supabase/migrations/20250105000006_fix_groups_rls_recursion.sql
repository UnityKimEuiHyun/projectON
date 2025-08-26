-- Fix infinite recursion in groups RLS policies
-- Migration: 20250105000006_fix_groups_rls_recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Group admins can manage their groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can update own status" ON public.group_members;

-- Create simplified policies that prevent recursion
-- Allow all authenticated users to view groups (for now)
CREATE POLICY "All authenticated users can view groups" ON public.groups
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to create groups
CREATE POLICY "Users can create groups" ON public.groups
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Allow group creators to update their groups
CREATE POLICY "Group creators can update their groups" ON public.groups
    FOR UPDATE USING (auth.uid() = created_by);

-- Allow group creators to delete their groups
CREATE POLICY "Group creators can delete their groups" ON public.groups
    FOR DELETE USING (auth.uid() = created_by);

-- Create simplified policies for group_members table
-- Allow all authenticated users to view group members
CREATE POLICY "All authenticated users can view group members" ON public.group_members
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to insert themselves into groups
CREATE POLICY "Users can join groups" ON public.group_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own records
CREATE POLICY "Users can update own records" ON public.group_members
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own records
CREATE POLICY "Users can leave groups" ON public.group_members
    FOR DELETE USING (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON POLICY "All authenticated users can view groups" ON public.groups IS '모든 인증된 사용자가 그룹을 볼 수 있도록 허용 (재귀 방지)';
COMMENT ON POLICY "All authenticated users can view group members" ON public.group_members IS '모든 인증된 사용자가 그룹 멤버를 볼 수 있도록 허용 (재귀 방지)';
