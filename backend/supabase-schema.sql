-- ============================================
-- Supabase Database Schema for SIP Returns
-- ============================================
-- This script creates all necessary tables for the SIP Returns application
-- Run this in your Supabase SQL Editor

-- 1. Hourly Prices Table (for hourly frequency data)
CREATE TABLE IF NOT EXISTS prices (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (symbol, timestamp)
);

-- Create index for faster queries on prices table
CREATE INDEX IF NOT EXISTS idx_prices_symbol_timestamp ON prices(symbol, timestamp);
CREATE INDEX IF NOT EXISTS idx_prices_timestamp ON prices(timestamp);

-- 2. Daily Prices Table (for daily/weekly/monthly frequency data)
CREATE TABLE IF NOT EXISTS daily_prices (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  price_usd DOUBLE PRECISION NOT NULL,
  price_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (symbol, price_date)
);

-- Create index for faster queries on daily_prices table
CREATE INDEX IF NOT EXISTS idx_daily_prices_symbol_date ON daily_prices(symbol, price_date);
CREATE INDEX IF NOT EXISTS idx_daily_prices_date ON daily_prices(price_date);

-- 3. Current Prices Table (for real-time prices)
CREATE TABLE IF NOT EXISTS current_prices (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL UNIQUE,
  price_usd DOUBLE PRECISION NOT NULL,
  last_updated TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for current_prices
CREATE INDEX IF NOT EXISTS idx_current_prices_symbol ON current_prices(symbol);

-- ============================================
-- Optional: Add Row Level Security (RLS)
-- ============================================
-- Enable RLS on tables (recommended for production)
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE current_prices ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
-- (Adjust these based on your security requirements)

-- Allow public read access to prices
CREATE POLICY "Allow public read access to prices"
  ON prices FOR SELECT
  USING (true);

-- Allow public read access to daily_prices
CREATE POLICY "Allow public read access to daily_prices"
  ON daily_prices FOR SELECT
  USING (true);

-- Allow public read access to current_prices
CREATE POLICY "Allow public read access to current_prices"
  ON current_prices FOR SELECT
  USING (true);

-- Allow authenticated users to insert/update prices (for your backend service)
-- Note: You'll need to use a service role key for these operations
CREATE POLICY "Allow service role to insert prices"
  ON prices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to insert daily_prices"
  ON daily_prices FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to insert/update current_prices"
  ON current_prices FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Sample Data Verification Queries
-- ============================================
-- After migration, run these to verify data:

-- Check total records in each table
-- SELECT 'prices' as table_name, COUNT(*) as record_count FROM prices
-- UNION ALL
-- SELECT 'daily_prices', COUNT(*) FROM daily_prices
-- UNION ALL
-- SELECT 'current_prices', COUNT(*) FROM current_prices;

-- Check min/max dates for each symbol
-- SELECT
--   symbol,
--   MIN(timestamp) as earliest_hourly,
--   MAX(timestamp) as latest_hourly,
--   COUNT(*) as hourly_count
-- FROM prices
-- GROUP BY symbol
-- ORDER BY symbol;

-- SELECT
--   symbol,
--   MIN(price_date) as earliest_daily,
--   MAX(price_date) as latest_daily,
--   COUNT(*) as daily_count
-- FROM daily_prices
-- GROUP BY symbol
-- ORDER BY symbol;
