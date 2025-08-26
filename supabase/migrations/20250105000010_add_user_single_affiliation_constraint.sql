-- Add constraint to ensure users can only be affiliated with one company at a time
-- Migration: 20250105000010_add_user_single_affiliation_constraint

-- First, check if there are any users with multiple active affiliations
-- and deactivate all but the most recent one
WITH multiple_affiliations AS (
  SELECT 
    user_id,
    group_id,
    joined_at,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY joined_at DESC) as rn
  FROM public.group_members 
  WHERE status = 'active'
),
to_deactivate AS (
  SELECT user_id, group_id
  FROM multiple_affiliations 
  WHERE rn > 1
)
UPDATE public.group_members 
SET status = 'inactive'
WHERE (user_id, group_id) IN (
  SELECT user_id, group_id FROM to_deactivate
);

-- Add unique constraint on user_id for active status
-- This ensures a user can only have one active affiliation at a time
-- First drop the constraint if it exists
ALTER TABLE public.group_members 
DROP CONSTRAINT IF EXISTS group_members_user_single_active;

-- Create a unique index with WHERE condition instead of constraint
-- This ensures a user can only have one active affiliation at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_group_members_user_single_active 
ON public.group_members(user_id) 
WHERE status = 'active';

-- Add comment for documentation
COMMENT ON INDEX idx_group_members_user_single_active 
IS '사용자는 한 번에 하나의 기업에만 활성 소속 상태를 가질 수 있음';

-- Create index for better performance on user_id queries
CREATE INDEX IF NOT EXISTS idx_group_members_user_id_status 
ON public.group_members(user_id, status);

-- Add trigger function to prevent multiple active affiliations
CREATE OR REPLACE FUNCTION public.check_single_affiliation()
RETURNS TRIGGER AS $$
BEGIN
  -- If inserting/updating to active status, check if user already has another active affiliation
  IF NEW.status = 'active' THEN
    IF EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE user_id = NEW.user_id 
        AND status = 'active' 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
    ) THEN
      RAISE EXCEPTION '사용자는 한 번에 하나의 기업에만 소속될 수 있습니다.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce single affiliation rule
DROP TRIGGER IF EXISTS trigger_check_single_affiliation ON public.group_members;

CREATE TRIGGER trigger_check_single_affiliation
  BEFORE INSERT OR UPDATE ON public.group_members
  FOR EACH ROW
  EXECUTE FUNCTION public.check_single_affiliation();

-- Add comment for the trigger
COMMENT ON TRIGGER trigger_check_single_affiliation ON public.group_members 
IS '사용자당 하나의 활성 소속만 허용하는 트리거';
