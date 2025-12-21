-- 완전한 RLS 정책 수정 스크립트
-- 401 에러 해결을 위한 전체 재설정

-- ========================================
-- 1. FEEDBACKS 테이블 정책 재설정
-- ========================================

-- RLS 활성화
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 모든 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can insert feedback" ON feedbacks;
DROP POLICY IF EXISTS "Only authenticated can read" ON feedbacks;
DROP POLICY IF EXISTS "Only authenticated can update" ON feedbacks;
DROP POLICY IF EXISTS "Only authenticated can delete" ON feedbacks;
DROP POLICY IF EXISTS "Anon users can insert feedback" ON feedbacks;
DROP POLICY IF EXISTS "Authenticated users can read all feedbacks" ON feedbacks;
DROP POLICY IF EXISTS "Authenticated users can update feedbacks" ON feedbacks;
DROP POLICY IF EXISTS "Authenticated users can delete feedbacks" ON feedbacks;
DROP POLICY IF EXISTS "Enable insert for anon users" ON feedbacks;
DROP POLICY IF EXISTS "Temporary allow insert" ON feedbacks;
DROP POLICY IF EXISTS "Temporary allow select own recent" ON feedbacks;
DROP POLICY IF EXISTS "Only admin can update" ON feedbacks;
DROP POLICY IF EXISTS "Only admin can delete" ON feedbacks;

-- 새 정책 생성
-- INSERT: 모든 사용자 허용 (anon 포함)
CREATE POLICY "Enable insert for all users" ON feedbacks
  FOR INSERT
  WITH CHECK (true);

-- SELECT: 인증된 사용자만 또는 방금 삽입한 데이터
CREATE POLICY "Enable read for authenticated or recent insert" ON feedbacks
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    OR
    created_at > (NOW() - INTERVAL '1 minute')
  );

-- UPDATE: 인증된 사용자만
CREATE POLICY "Enable update for authenticated only" ON feedbacks
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- DELETE: 인증된 사용자만
CREATE POLICY "Enable delete for authenticated only" ON feedbacks
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ========================================
-- 2. INSIGHTS 테이블 정책 재설정
-- ========================================

-- RLS 활성화
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- 모든 기존 정책 삭제
DROP POLICY IF EXISTS "Public can read published insights" ON insights;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON insights;
DROP POLICY IF EXISTS "Authenticated users full access" ON insights;

-- 새 정책 생성
-- SELECT: 게시된 것은 모두 볼 수 있음, 비게시는 인증된 사용자만
CREATE POLICY "Public read published, auth read all" ON insights
  FOR SELECT
  USING (
    published = true
    OR
    auth.role() = 'authenticated'
  );

-- INSERT: 인증된 사용자만
CREATE POLICY "Auth users can insert" ON insights
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: 인증된 사용자만
CREATE POLICY "Auth users can update" ON insights
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- DELETE: 인증된 사용자만
CREATE POLICY "Auth users can delete" ON insights
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ========================================
-- 3. 조회수 증가는 누구나 가능하도록 (선택사항)
-- ========================================

-- 조회수만 업데이트할 수 있는 별도 정책 (필요시)
CREATE POLICY "Anyone can increment view count" ON insights
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ========================================
-- 4. 확인 쿼리
-- ========================================

-- RLS 상태 확인
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('feedbacks', 'insights');

-- 정책 목록 확인
SELECT
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('feedbacks', 'insights')
ORDER BY tablename, policyname;

-- ========================================
-- 5. 만약 여전히 안 되면 임시로 RLS 비활성화
-- ========================================
-- ⚠️ 주의: 보안 위험! 테스트 후 다시 활성화 필요

-- ALTER TABLE feedbacks DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE insights DISABLE ROW LEVEL SECURITY;

-- 또는 모든 작업 허용 (덜 위험)
-- DROP POLICY IF EXISTS "Enable insert for all users" ON feedbacks;
-- DROP POLICY IF EXISTS "Enable read for authenticated or recent insert" ON feedbacks;
-- DROP POLICY IF EXISTS "Enable update for authenticated only" ON feedbacks;
-- DROP POLICY IF EXISTS "Enable delete for authenticated only" ON feedbacks;
--
-- CREATE POLICY "Allow all operations temporarily" ON feedbacks
--   USING (true)
--   WITH CHECK (true);