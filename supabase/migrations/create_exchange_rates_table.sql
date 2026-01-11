-- Exchange rates cache table (JSON format: one row per source+date)
DROP TABLE IF EXISTS exchange_rates;

CREATE TABLE exchange_rates (
  id SERIAL PRIMARY KEY,
  source VARCHAR(20) NOT NULL, -- 'unipass' or 'hanabank'
  date DATE NOT NULL,
  rates JSONB NOT NULL, -- { "USD": 1450.5, "EUR": 1580.2, ... }
  currency_names JSONB, -- { "USD": "미국 달러", "EUR": "유로", ... }
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(source, date)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(date DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_source ON exchange_rates(source);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_source_date ON exchange_rates(source, date);

-- Enable RLS
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON exchange_rates
  FOR SELECT USING (true);

-- Allow public insert (for caching)
CREATE POLICY "Allow public insert" ON exchange_rates
  FOR INSERT WITH CHECK (true);

-- Allow public update (for caching)
CREATE POLICY "Allow public update" ON exchange_rates
  FOR UPDATE USING (true);
