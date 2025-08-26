-- Fix RLS policies for groups table to allow all users to view groups
-- Migration: 20250105000005_fix_groups_rls_policies

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Group admins can manage their groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;

-- Create new policies for groups table
-- Allow all authenticated users to view groups
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

-- Create new policies for group_members table
-- Allow all authenticated users to view group members
CREATE POLICY "All authenticated users can view group members" ON public.group_members
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow group creators to manage members
CREATE POLICY "Group creators can manage members" ON public.group_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.groups 
            WHERE id = group_id AND created_by = auth.uid()
        )
    );
