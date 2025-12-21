-- feedbacks 테이블에 user_agent 컬럼 추가
ALTER TABLE feedbacks
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- ip_address 컬럼도 추가 (향후 사용)
ALTER TABLE feedbacks
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);

-- 인덱스 추가 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_feedbacks_email_created
ON feedbacks(email, created_at);

-- 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'feedbacks';