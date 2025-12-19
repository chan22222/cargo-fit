-- Supabase SQL Editor에서 실행할 스크립트
-- 1. Supabase 대시보드 > SQL Editor 열기
-- 2. 아래 쿼리 전체 복사하여 실행

-- Insights 테이블 생성
CREATE TABLE IF NOT EXISTS insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tag VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  date VARCHAR(20) NOT NULL,
  image_url TEXT NOT NULL,
  content TEXT,
  author VARCHAR(100),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS (Row Level Security) 활성화
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Public can read published insights" ON insights;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON insights;

-- 읽기 정책 (게시된 콘텐츠는 누구나 읽기 가능)
CREATE POLICY "Public can read published insights" ON insights
  FOR SELECT USING (published = true);

-- 인증된 사용자는 모든 작업 가능
CREATE POLICY "Authenticated users can do everything" ON insights
  FOR ALL USING (auth.role() = 'authenticated');

-- 업데이트 시 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거가 이미 존재하면 삭제
DROP TRIGGER IF EXISTS update_insights_updated_at ON insights;

-- 트리거 생성
CREATE TRIGGER update_insights_updated_at
  BEFORE UPDATE ON insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 초기 데이터 삽입 (선택사항)
INSERT INTO insights (tag, title, date, image_url, published) VALUES
  ('Logistics', '2024년 해상 운임 전망 및 컨테이너 수급 분석', '2024.05.24', 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?auto=format&fit=crop&q=80&w=400', true),
  ('Tech', 'AI와 머신러닝이 바꾸는 창고 자동화 시스템의 미래', '2024.05.20', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400', true),
  ('Sustainability', '해운업계의 탄소 중립 실현을 위한 대체 연료 기술', '2024.05.15', 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&q=80&w=400', true)
ON CONFLICT DO NOTHING;