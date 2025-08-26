-- Add phone field to profiles table
-- Migration: 20250105000011_add_phone_to_profiles

-- Add phone field
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.phone IS '사용자 전화번호';

-- Create index for better performance on phone queries
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
