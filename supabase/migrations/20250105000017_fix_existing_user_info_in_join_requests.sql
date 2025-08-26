-- Fix existing user information in group_join_requests table
-- Migration: 20250105000017_fix_existing_user_info_in_join_requests

-- Update existing records with correct user information from profiles table
UPDATE public.group_join_requests 
SET 
  user_display_name = profiles.display_name,
  user_email = profiles.email
FROM public.profiles 
WHERE 
  group_join_requests.user_id = profiles.user_id 
  AND group_join_requests.user_display_name IS NOT NULL
  AND group_join_requests.user_display_name != profiles.display_name;

-- Verify the update
SELECT 
  gjr.id,
  gjr.user_id,
  gjr.user_display_name,
  gjr.user_email,
  p.display_name as profile_display_name,
  p.email as profile_email
FROM public.group_join_requests gjr
LEFT JOIN public.profiles p ON gjr.user_id = p.user_id
WHERE gjr.status = 'pending'
ORDER BY gjr.created_at DESC
LIMIT 10;
