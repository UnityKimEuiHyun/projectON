-- Create groups table for organization management
-- Migration: 20250105000004_create_groups_table

-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(group_id, user_id)
);

-- Add comments for documentation
COMMENT ON TABLE public.group_members IS '사용자와 기업 간의 소속 관계를 관리하는 테이블';
COMMENT ON COLUMN public.group_members.group_id IS '소속할 기업의 ID';
COMMENT ON COLUMN public.group_members.user_id IS '소속할 사용자의 ID';
COMMENT ON COLUMN public.group_members.role IS '사용자 역할: admin(관리자), manager(매니저), member(일반멤버)';
COMMENT ON COLUMN public.group_members.status IS '사용자 소속 상태: active(활성), inactive(비활성), pending(대기), suspended(정지)';
COMMENT ON COLUMN public.group_members.joined_at IS '소속 시작일';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_parent_group_id ON public.groups(parent_group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);

-- Enable Row Level Security
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Create policies for groups table
CREATE POLICY "Users can view groups they are members of" ON public.groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Group admins can manage their groups" ON public.groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = id AND user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for group_members table
CREATE POLICY "Users can view members of groups they belong to" ON public.group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.status = 'active'
        )
    );

CREATE POLICY "Group admins can manage members" ON public.group_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.role = 'admin' AND gm.status = 'active'
        )
    );

-- Users can insert themselves into groups
CREATE POLICY "Users can join groups" ON public.group_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own status
CREATE POLICY "Users can update own status" ON public.group_members
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_groups_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON public.groups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_groups_updated_at_column();

-- Insert sample groups for testing
INSERT INTO public.groups (name, description, created_by) VALUES
    ('개발팀', '소프트웨어 개발을 담당하는 팀', (SELECT id FROM auth.users LIMIT 1)),
    ('디자인팀', 'UI/UX 디자인을 담당하는 팀', (SELECT id FROM auth.users LIMIT 1)),
    ('기획팀', '프로젝트 기획 및 관리', (SELECT id FROM auth.users LIMIT 1)),
    ('QA팀', '품질 보증 및 테스트', (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert sample group members (first user as admin of first group)
INSERT INTO public.group_members (group_id, user_id, role, status) VALUES
    ((SELECT id FROM public.groups WHERE name = '개발팀' LIMIT 1), 
     (SELECT id FROM auth.users LIMIT 1), 'admin', 'active')
ON CONFLICT DO NOTHING;
