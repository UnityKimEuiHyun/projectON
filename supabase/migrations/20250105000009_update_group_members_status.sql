-- Update group_members table to add status column
-- Migration: 20250105000009_update_group_members_status

-- Add status column if it doesn't exist
ALTER TABLE public.group_members
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';

-- Add check constraint to ensure valid status values
ALTER TABLE public.group_members
DROP CONSTRAINT IF EXISTS group_members_status_check;

ALTER TABLE public.group_members
ADD CONSTRAINT group_members_status_check
CHECK (status IN ('active', 'inactive', 'pending', 'suspended'));

-- Update existing records to have 'active' status if they don't have one
UPDATE public.group_members
SET status = 'active'
WHERE status IS NULL OR status = '';

-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_group_members_status ON public.group_members(status);

-- Add comment for documentation
COMMENT ON COLUMN public.group_members.status IS '사용자 소속 상태: active(활성), inactive(비활성), pending(대기), suspended(정지)';

-- Update RLS policies to consider status
DROP POLICY IF EXISTS "Users can view members of groups they belong to" ON public.group_members;
CREATE POLICY "Users can view members of groups they belong to" ON public.group_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.status = 'active'
        )
    );

DROP POLICY IF EXISTS "Group admins can manage members" ON public.group_members;
CREATE POLICY "Group admins can manage members" ON public.group_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.role = 'admin' AND gm.status = 'active'
        )
    );

-- Add new policies for better member management
CREATE POLICY IF NOT EXISTS "Users can join groups" ON public.group_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own status" ON public.group_members
    FOR UPDATE USING (auth.uid() = user_id);
