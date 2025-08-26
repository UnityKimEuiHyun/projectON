-- Make group name unique and not null
-- Migration: 20250105000007_make_group_name_unique

-- First, ensure no existing groups have null names
UPDATE public.groups SET name = 'Unnamed Group' WHERE name IS NULL;

-- Make name column NOT NULL
ALTER TABLE public.groups ALTER COLUMN name SET NOT NULL;

-- Add unique constraint on name column
ALTER TABLE public.groups ADD CONSTRAINT groups_name_unique UNIQUE (name);

-- Add comment for documentation
COMMENT ON COLUMN public.groups.name IS '그룹명 (고유값, 필수)';
