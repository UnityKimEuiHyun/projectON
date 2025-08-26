-- Simplify group_members role system to admin and member only
-- Migration: 20250105000005_simplify_roles

-- Update the role check constraint to only allow 'admin' and 'member'
ALTER TABLE public.group_members 
DROP CONSTRAINT IF EXISTS group_members_role_check;

ALTER TABLE public.group_members 
ADD CONSTRAINT group_members_role_check 
CHECK (role IN ('admin', 'member'));

-- Update existing 'manager' roles to 'member'
UPDATE public.group_members 
SET role = 'member' 
WHERE role = 'manager';

-- Update the default role to 'member' (though it's already the default)
ALTER TABLE public.group_members 
ALTER COLUMN role SET DEFAULT 'member';

-- Update comments for documentation
COMMENT ON COLUMN public.group_members.role IS '사용자 역할: admin(관리자), member(일반멤버)';

-- Update RLS policies to reflect the new role system
-- Drop existing policies
DROP POLICY IF EXISTS "Group admins can manage their groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;

-- Recreate policies with simplified roles
CREATE POLICY "Group admins can manage their groups" ON public.groups
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.group_members 
            WHERE group_id = id AND user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Group admins can manage members" ON public.group_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.role = 'admin' AND gm.status = 'active'
        )
    );
