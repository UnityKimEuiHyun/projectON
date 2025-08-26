-- Cleanup rejected requests and simplify status management
-- Migration: 20250105000013_cleanup_rejected_requests

-- 1. Delete all rejected requests (they will be removed instead of kept)
DELETE FROM group_join_requests WHERE status = 'rejected';

-- 2. Check remaining data
SELECT 
  status,
  COUNT(*) as count
FROM group_join_requests 
GROUP BY status
ORDER BY status;

-- 3. Verify the cleanup
SELECT 
  id,
  group_id,
  user_id,
  status,
  message,
  created_at
FROM group_join_requests 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Add comment for documentation
COMMENT ON TABLE public.group_join_requests IS '가입 요청 테이블 - pending(대기중), approved(승인됨) 상태만 사용. rejected는 삭제됨.';
