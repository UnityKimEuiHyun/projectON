-- 사용자가 여러 기업에 소속될 수 있도록 단일 소속 제약 조건 제거
-- 기존 제약 조건 삭제
DO $$
BEGIN
    -- 기존 제약 조건이 있는지 확인하고 삭제
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_single_affiliation_constraint' 
        AND table_name = 'group_members'
    ) THEN
        ALTER TABLE group_members DROP CONSTRAINT user_single_affiliation_constraint;
        RAISE NOTICE '기존 단일 소속 제약 조건이 제거되었습니다.';
    ELSE
        RAISE NOTICE '단일 소속 제약 조건이 이미 존재하지 않습니다.';
    END IF;
END $$;

-- group_members 테이블의 user_id에 대한 인덱스 확인 및 최적화
-- 여러 기업에 소속된 사용자의 조회 성능 향상을 위해
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_group ON group_members(user_id, group_id);

-- 변경 사항 확인
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'group_members' 
    AND tc.constraint_type = 'UNIQUE';

-- 인덱스 확인
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'group_members';
