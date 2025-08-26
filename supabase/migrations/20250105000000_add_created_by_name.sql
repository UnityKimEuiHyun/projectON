-- 프로젝트 테이블에 생성자 이름 필드 추가
ALTER TABLE projects 
ADD COLUMN created_by_name TEXT;

-- 기존 데이터의 created_by_name을 기본값으로 설정 (실제 사용자 이름으로 업데이트 필요)
UPDATE projects 
SET created_by_name = '시스템 관리자' 
WHERE created_by_name IS NULL;

-- created_by_name을 NOT NULL로 설정
ALTER TABLE projects 
ALTER COLUMN created_by_name SET NOT NULL;

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX idx_projects_created_by_name ON projects(created_by_name);
