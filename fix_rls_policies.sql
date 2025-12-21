-- 401 에러 해결: 익명 사용자도 피드백을 제출할 수 있도록 정책 수정

-- 1. 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Anon users can insert feedback" ON feedbacks;
DROP POLICY IF EXISTS "Authenticated users can read all feedbacks" ON feedbacks;
DROP POLICY IF EXISTS "Authenticated users can update feedbacks" ON feedbacks;
DROP POLICY IF EXISTS "Authenticated users can delete feedbacks" ON feedbacks;
DROP POLICY IF EXISTS "Enable insert for anon users" ON feedbacks;

-- 2. 새로운 정책 생성 (anon과 authenticated 둘 다 포함)

-- INSERT: 누구나 피드백 제출 가능 (anon, authenticated 모두)
CREATE POLICY "Anyone can insert feedback" ON feedbacks
  FOR INSERT
  WITH CHECK (true);

-- SELECT: 인증된 사용자(관리자)만 조회 가능
CREATE POLICY "Only authenticated can read" ON feedbacks
  FOR SELECT
  TO authenticated
  USING (true);

-- UPDATE: 인증된 사용자(관리자)만 수정 가능
CREATE POLICY "Only authenticated can update" ON feedbacks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: 인증된 사용자(관리자)만 삭제 가능
CREATE POLICY "Only authenticated can delete" ON feedbacks
  FOR DELETE
  TO authenticated
  USING (true);

-- 3. RLS가 활성화되어 있는지 확인
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 4. 정책 확인
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'feedbacks'
ORDER BY policyname;

-- 5. 테스트: 이 쿼리가 작동해야 함 (Supabase 클라이언트에서)
-- INSERT INTO feedbacks (name, email, message, type, created_at, read)
-- VALUES ('테스트', 'test@test.com', '테스트 메시지', 'feedback', NOW(), false);