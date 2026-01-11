-- FS/SC (Fuel Surcharge / Security Charge) 테이블 생성
-- Supabase Dashboard > SQL Editor 에서 실행

CREATE TABLE IF NOT EXISTS fssc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(2) NOT NULL CHECK (type IN ('FS', 'SC')),
  carrier_code VARCHAR(5) NOT NULL,
  carrier_name VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'KRW',
  min_charge DECIMAL(10, 2),
  over_charge DECIMAL(10, 2),
  route TEXT NOT NULL,
  remark TEXT,
  charge_code VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_fssc_type ON fssc(type);
CREATE INDEX IF NOT EXISTS idx_fssc_carrier_code ON fssc(carrier_code);
CREATE INDEX IF NOT EXISTS idx_fssc_date_range ON fssc(start_date, end_date);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE fssc ENABLE ROW LEVEL SECURITY;

-- 읽기 권한: 모든 사용자 (인증 여부 상관없이)
CREATE POLICY "Allow public read access" ON fssc
  FOR SELECT
  USING (true);

-- 쓰기 권한: 인증된 사용자만
CREATE POLICY "Allow authenticated insert" ON fssc
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON fssc
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete" ON fssc
  FOR DELETE
  TO authenticated
  USING (true);

-- 샘플 데이터 (선택사항)
-- INSERT INTO fssc (type, carrier_code, carrier_name, start_date, end_date, currency, min_charge, over_charge, route, remark, charge_code) VALUES
-- ('FS', 'KE', 'Korean Air', '2025-12-01', '2026-01-31', 'KRW', NULL, 570, '한국발 국제선 전노선', 'KRW 적용', 'FSC'),
-- ('FS', 'OZ', 'Asiana Airlines', '2025-12-01', '2026-01-31', 'KRW', NULL, 550, '한국발 국제선 전노선', 'KRW 적용', 'FSC'),
-- ('SC', 'KE', 'Korean Air', '2025-01-01', '2026-12-31', 'KRW', NULL, 100, '한국발 국제선 전노선', 'KRW 적용', 'SCC');
