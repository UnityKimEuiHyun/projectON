-- Fix infinite recursion in groups RLS policies
-- 이 SQL을 Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. 현재 존재하는 모든 RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('groups', 'group_members');

-- 2. 기존 문제가 있는 RLS 정책들을 모두 제거
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Group admins can manage their groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can update own status" ON public.group_members;

-- 3. 중복될 수 있는 기존 정책들도 제거
DROP POLICY IF EXISTS "All authenticated users can view groups" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Group creators can update their groups" ON public.groups;
DROP POLICY IF EXISTS "Group creators can delete their groups" ON public.groups;
DROP POLICY IF EXISTS "All authenticated users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can update own records" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;

-- 누락된 정책들도 제거
DROP POLICY IF EXISTS "Group creators can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Group creators can manage their groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON public.group_members;

-- 4. 정책 제거 후 상태 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('groups', 'group_members');

-- 5. 새로운 단순화된 RLS 정책 생성 (재귀 참조 없음)

-- groups 테이블 정책
CREATE POLICY "All authenticated users can view groups" ON public.groups
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create groups" ON public.groups
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups" ON public.groups
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups" ON public.groups
    FOR DELETE USING (auth.uid() = created_by);

-- group_members 테이블 정책
CREATE POLICY "All authenticated users can view group members" ON public.group_members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can join groups" ON public.group_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records" ON public.group_members
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" ON public.group_members
    FOR DELETE USING (auth.uid() = user_id);

-- 6. 새로운 정책들이 생성되었는지 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('groups', 'group_members');

-- 7. 테스트를 위한 간단한 쿼리 실행
-- 이 쿼리들이 에러 없이 실행되어야 합니다
SELECT COUNT(*) FROM public.groups;
SELECT COUNT(*) FROM public.group_members;
