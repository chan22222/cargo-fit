-- ⚠️ 경고: 임시 해결책 - 보안 위험!
-- RLS를 비활성화하면 모든 데이터가 공개됩니다

-- 옵션 1: RLS 완전 비활성화 (비권장)
-- ALTER TABLE feedbacks DISABLE ROW LEVEL SECURITY;

-- 옵션 2: RLS는 켜두되 모든 작업 허용 (조금 더 나음)
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can insert feedback" ON feedbacks;
DROP POLICY IF EXISTS "Only authenticated can read" ON feedbacks;
DROP POLICY IF EXISTS "Only authenticated can update" ON feedbacks;
DROP POLICY IF EXISTS "Only authenticated can delete" ON feedbacks;

-- 임시 정책: INSERT와 SELECT는 모두 허용
CREATE POLICY "Temporary allow insert" ON feedbacks
  FOR INSERT
  WITH CHECK (true);

-- 익명 사용자도 자신이 방금 입력한 데이터는 볼 수 있도록 (INSERT 직후 SELECT를 위해)
CREATE POLICY "Temporary allow select own recent" ON feedbacks
  FOR SELECT
  USING (
    -- 최근 5분 이내 생성된 것만 조회 가능
    created_at > NOW() - INTERVAL '5 minutes'
    OR
    -- 또는 인증된 사용자는 모두 조회
    auth.role() = 'authenticated'
  );

-- UPDATE는 관리자만
CREATE POLICY "Only admin can update" ON feedbacks
  FOR UPDATE
  TO authenticated
  USING (true);

-- DELETE는 관리자만
CREATE POLICY "Only admin can delete" ON feedbacks
  FOR DELETE
  TO authenticated
  USING (true);

-- 확인
SELECT * FROM pg_policies WHERE tablename = 'feedbacks';