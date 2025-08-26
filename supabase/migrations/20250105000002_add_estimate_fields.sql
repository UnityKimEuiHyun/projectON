-- Add estimate fields to projects table
-- Migration: 20250105000002_add_estimate_fields

-- Add estimate_amount field
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS estimate_amount TEXT;

-- Add estimate_note field  
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS estimate_note TEXT;

-- Add comments for documentation
COMMENT ON COLUMN projects.estimate_amount IS '견적 금액 (원 단위)';
COMMENT ON COLUMN projects.estimate_note IS '견적에 대한 추가 정보 및 비고';
