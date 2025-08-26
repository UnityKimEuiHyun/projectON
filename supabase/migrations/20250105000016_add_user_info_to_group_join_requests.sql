-- Add user information columns to group_join_requests table
-- Migration: 20250105000016_add_user_info_to_group_join_requests

-- Add user_display_name column
ALTER TABLE public.group_join_requests 
ADD COLUMN IF NOT EXISTS user_display_name TEXT;

-- Add user_email column
ALTER TABLE public.group_join_requests 
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.group_join_requests.user_display_name IS '사용자 표시 이름 (가입 요청 시 저장)';
COMMENT ON COLUMN public.group_join_requests.user_email IS '사용자 이메일 (가입 요청 시 저장)';

-- Verify the new columns
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'group_join_requests' 
AND column_name IN ('user_display_name', 'user_email')
ORDER BY column_name;
