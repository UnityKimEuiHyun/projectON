-- 비용 관리 공유 권한 테이블 생성
CREATE TABLE cost_management_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  shared_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL CHECK (permission_type IN ('view', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, shared_with_user_id)
);

-- 인덱스 생성
CREATE INDEX idx_cost_management_shares_project_id ON cost_management_shares(project_id);
CREATE INDEX idx_cost_management_shares_shared_with_user_id ON cost_management_shares(shared_with_user_id);
CREATE INDEX idx_cost_management_shares_shared_by_user_id ON cost_management_shares(shared_by_user_id);

-- RLS 정책 설정
ALTER TABLE cost_management_shares ENABLE ROW LEVEL SECURITY;

-- 프로젝트 소유자와 공유받은 사용자만 조회 가능
CREATE POLICY "Users can view cost management shares they created or received"
ON cost_management_shares
FOR SELECT
USING (
  shared_by_user_id = auth.uid() OR 
  shared_with_user_id = auth.uid()
);

-- 프로젝트 소유자만 공유 생성 가능
CREATE POLICY "Project owners can create cost management shares"
ON cost_management_shares
FOR INSERT
WITH CHECK (
  shared_by_user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM projects p
    JOIN group_members gm ON p.group_id = gm.group_id
    WHERE p.id = project_id 
    AND gm.user_id = auth.uid() 
    AND gm.role = 'owner'
  )
);

-- 프로젝트 소유자만 공유 수정 가능
CREATE POLICY "Project owners can update cost management shares"
ON cost_management_shares
FOR UPDATE
USING (
  shared_by_user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM projects p
    JOIN group_members gm ON p.group_id = gm.group_id
    WHERE p.id = project_id 
    AND gm.user_id = auth.uid() 
    AND gm.role = 'owner'
  )
);

-- 프로젝트 소유자만 공유 삭제 가능
CREATE POLICY "Project owners can delete cost management shares"
ON cost_management_shares
FOR DELETE
USING (
  shared_by_user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM projects p
    JOIN group_members gm ON p.group_id = gm.group_id
    WHERE p.id = project_id 
    AND gm.user_id = auth.uid() 
    AND gm.role = 'owner'
  )
);

-- updated_at 자동 업데이트를 위한 트리거
CREATE OR REPLACE FUNCTION update_cost_management_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cost_management_shares_updated_at
  BEFORE UPDATE ON cost_management_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_cost_management_shares_updated_at();
