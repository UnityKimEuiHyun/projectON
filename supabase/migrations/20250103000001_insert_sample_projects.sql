-- Insert sample projects for testing
-- Note: Replace 'your-user-id' with actual user ID from auth.users table

INSERT INTO public.projects (name, description, status, progress, due_date, team_size, priority, user_id) VALUES
(
  '웹사이트 리뉴얼',
  '회사 홈페이지 전면 리뉴얼 프로젝트',
  '진행중',
  65,
  '2024-01-15',
  5,
  '높음',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  '모바일 앱 개발',
  '크로스 플랫폼 모바일 애플리케이션',
  '진행중',
  40,
  '2024-02-28',
  8,
  '중간',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  '데이터베이스 최적화',
  '시스템 성능 개선 및 DB 최적화',
  '대기중',
  20,
  '2024-01-30',
  3,
  '높음',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  '마케팅 캠페인',
  '신제품 런칭 마케팅 전략 수립',
  '완료',
  100,
  '2023-12-20',
  4,
  '중간',
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'API 문서화',
  '개발자를 위한 API 가이드 작성',
  '진행중',
  80,
  '2024-01-10',
  2,
  '낮음',
  (SELECT id FROM auth.users LIMIT 1)
);
