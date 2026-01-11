-- Exchange rates cache table
CREATE TABLE IF NOT EXISTS exchange_rates (
  id SERIAL PRIMARY KEY,
  source VARCHAR(20) NOT NULL, -- 'unipass' or 'hanabank'
  currency VARCHAR(10) NOT NULL,
  rate DECIMAL(20, 6),
  date DATE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(source, currency, date)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON exchange_rates(date DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_source ON exchange_rates(source);

-- Enable RLS
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON exchange_rates
  FOR SELECT USING (true);

-- Allow public insert/update (for caching)
CREATE POLICY "Allow public insert" ON exchange_rates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON exchange_rates
  FOR UPDATE USING (true);
