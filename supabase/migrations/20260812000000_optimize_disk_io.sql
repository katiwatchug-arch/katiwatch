-- =====================================================
-- SUPABASE DISK IO OPTIMIZATION MIGRATION
-- =====================================================
-- This migration adds critical indexes and functions to reduce Disk IO
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. ADD MISSING INDEXES FOR VIEW TRACKING
-- =====================================================

-- Note: view_logs already has these indexes from schema.sql:
-- - idx_view_logs_movie_id
-- - idx_view_logs_series_id
-- - idx_view_logs_created_at

-- Composite index for user-specific view history
CREATE INDEX IF NOT EXISTS idx_view_logs_user_movie 
ON view_logs(user_id, movie_id, created_at DESC) 
WHERE movie_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_view_logs_user_series 
ON view_logs(user_id, series_id, created_at DESC) 
WHERE series_id IS NOT NULL;

-- Index for IP-based analytics
CREATE INDEX IF NOT EXISTS idx_view_logs_ip_created 
ON view_logs(ip_address, created_at DESC);


-- =====================================================
-- 2. ADD MISSING INDEXES FOR WATCHLISTS
-- =====================================================

-- Note: watchlists already has these indexes from schema.sql:
-- - idx_watchlists_user_id
-- - idx_watchlists_movie_id  
-- - idx_watchlists_series_id

-- Add created_at index for sorting recent additions
CREATE INDEX IF NOT EXISTS idx_watchlists_created_at 
ON watchlists(created_at DESC);


-- =====================================================
-- 3. ADD MISSING INDEXES FOR PAYMENT PROCESSING
-- =====================================================

-- Note: makypay_transactions already has these indexes from schema.sql:
-- - idx_makypay_transactions_user_id
-- - idx_makypay_transactions_uuid  
-- - idx_makypay_transactions_reference
-- - idx_makypay_transactions_status
-- - idx_makypay_transactions_created_at

-- YoPayments transaction indexes (adding missing ones)
CREATE INDEX IF NOT EXISTS idx_yopayments_tx_ref 
ON yopayments_transactions(transaction_reference);

CREATE INDEX IF NOT EXISTS idx_yopayments_internal_ref 
ON yopayments_transactions(internal_reference);

CREATE INDEX IF NOT EXISTS idx_yopayments_user_id 
ON yopayments_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_yopayments_status
ON yopayments_transactions(status);

CREATE INDEX IF NOT EXISTS idx_yopayments_created_at
ON yopayments_transactions(created_at DESC);


-- =====================================================
-- 4. ADD INDEXES FOR SUBSCRIPTION QUERIES
-- =====================================================

-- Index for active subscription lookups (used in auth checks)
CREATE INDEX IF NOT EXISTS idx_profiles_subscription 
ON profiles(subscription, subscription_expiry_date) 
WHERE subscription IS NOT NULL AND subscription != 'free';

-- Index for plan lookups by lowercase name (webhook processing)
CREATE INDEX IF NOT EXISTS idx_plans_name_lower 
ON plans(LOWER(name));


-- =====================================================
-- 5. CREATE ATOMIC VIEW INCREMENT FUNCTION
-- =====================================================

-- Function to atomically increment view count (prevents race conditions)
CREATE OR REPLACE FUNCTION increment_views(
  table_name TEXT,
  content_id TEXT
) RETURNS VOID AS $$
BEGIN
  -- Dynamically update the specified table
  IF table_name = 'movies' THEN
    UPDATE movies 
    SET views = COALESCE(views, 0) + 1 
    WHERE id = content_id;
  ELSIF table_name = 'series' THEN
    UPDATE series 
    SET views = COALESCE(views, 0) + 1 
    WHERE id = content_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- 6. ADD INDEXES FOR MOVIES AND SERIES VIEWS COLUMN
-- =====================================================

-- These help with sorting by popularity
CREATE INDEX IF NOT EXISTS idx_movies_views 
ON movies(views DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_series_views 
ON series(views DESC NULLS LAST);


-- =====================================================
-- 7. OPTIMIZE EXISTING TABLES (OPTIONAL)
-- =====================================================

-- Analyze tables to update statistics for query planner
ANALYZE view_logs;
ANALYZE watchlists;
ANALYZE makypay_transactions;
ANALYZE yopayments_transactions;
ANALYZE profiles;
ANALYZE plans;
ANALYZE movies;
ANALYZE series;

-- Vacuum to reclaim space and update statistics
-- Note: This may take time on large tables
-- VACUUM ANALYZE view_logs;
-- VACUUM ANALYZE watchlists;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run to verify new indexes were created:
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname IN (
    'idx_view_logs_user_movie',
    'idx_view_logs_user_series',
    'idx_view_logs_ip_created',
    'idx_watchlists_created_at',
    'idx_yopayments_tx_ref',
    'idx_yopayments_internal_ref',
    'idx_yopayments_user_id',
    'idx_yopayments_status',
    'idx_yopayments_created_at',
    'idx_profiles_subscription',
    'idx_plans_name_lower',
    'idx_movies_views',
    'idx_series_views'
  )
ORDER BY tablename, indexname;
