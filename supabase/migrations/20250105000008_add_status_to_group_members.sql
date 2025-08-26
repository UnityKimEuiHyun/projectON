-- Add status column to group_members table
-- Migration: 20250105000008_add_status_to_group_members

-- Add status column with default value 'active'
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

-- Update existing comments
COMMENT ON TABLE public.group_members IS '사용자와 기업 간의 소속 관계를 관리하는 테이블';
COMMENT ON COLUMN public.group_members.group_id IS '소속할 기업의 ID';
COMMENT ON COLUMN public.group_members.user_id IS '소속할 사용자의 ID';
COMMENT ON COLUMN public.group_members.joined_at IS '소속 시작일';
COMMENT ON COLUMN public.group_members.status IS '사용자 소속 상태';
