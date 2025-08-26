-- Add contract_date field to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS contract_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN public.projects.contract_date IS '프로젝트 계약일';
