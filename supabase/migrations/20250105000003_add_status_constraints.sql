-- Add status constraints to projects table
-- Migration: 20250105000003_add_status_constraints

-- Drop existing status check constraint if it exists
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Add new status check constraint with allowed values
ALTER TABLE projects 
ADD CONSTRAINT projects_status_check 
CHECK (status IN ('계약전', '진행중', '완료', '보류', '취소'));

-- Add comment for documentation
COMMENT ON COLUMN projects.status IS '프로젝트 상태: 계약전, 진행중, 완료, 보류, 취소';

-- Update existing records to use valid status values if needed
UPDATE projects SET status = '진행중' WHERE status NOT IN ('계약전', '진행중', '완료', '보류', '취소');
