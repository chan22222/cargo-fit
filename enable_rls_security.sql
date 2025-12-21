-- ⚠️ 중요: RLS를 활성화하여 데이터 보호
-- feedbacks 테이블에 RLS 활성화

-- 1. RLS 활성화
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Enable insert for anon users" ON feedbacks;
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON feedbacks;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON feedbacks;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON feedbacks;

-- 3. 새로운 정책 생성

-- 익명 사용자는 INSERT만 가능 (피드백 제출)
CREATE POLICY "Anon users can insert feedback" ON feedbacks
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 인증된 사용자(관리자)만 READ 가능
CREATE POLICY "Authenticated users can read all feedbacks" ON feedbacks
  FOR SELECT
  TO authenticated
  USING (true);

-- 인증된 사용자(관리자)만 UPDATE 가능
CREATE POLICY "Authenticated users can update feedbacks" ON feedbacks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 인증된 사용자(관리자)만 DELETE 가능
CREATE POLICY "Authenticated users can delete feedbacks" ON feedbacks
  FOR DELETE
  TO authenticated
  USING (true);

-- 4. insights 테이블도 보호 (만약 RLS가 비활성화되어 있다면)
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- insights 정책 재설정
DROP POLICY IF EXISTS "Public can read published insights" ON insights;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON insights;

-- 게시된 insights는 누구나 읽기 가능
CREATE POLICY "Public can read published insights" ON insights
  FOR SELECT
  USING (published = true);

-- 인증된 사용자는 모든 작업 가능
CREATE POLICY "Authenticated users full access" ON insights
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. 확인 쿼리
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('feedbacks', 'insights');

-- 결과가 다음과 같아야 함:
-- tablename | rowsecurity
-- ----------|------------
-- feedbacks | t (true)
-- insights  | t (true)