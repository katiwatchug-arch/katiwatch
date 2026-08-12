-- =====================================================
-- ENHANCED ROW LEVEL SECURITY POLICIES
-- =====================================================
-- This migration adds stricter RLS policies to prevent
-- unauthorized access and data leakage

-- =====================================================
-- 1. PROFILES - Stricter Policies
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

-- Recreate with stricter rules
CREATE POLICY "profiles_select_own" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Prevent users from deleting their own profile (admin-only operation)
CREATE POLICY "profiles_no_delete" 
  ON profiles FOR DELETE 
  USING (false);


-- =====================================================
-- 2. TRANSACTIONS - Prevent Data Leakage
-- =====================================================

-- MakyPay: Users can only see their own transactions
DROP POLICY IF EXISTS "makypay_select_own" ON makypay_transactions;
DROP POLICY IF EXISTS "makypay_service_insert" ON makypay_transactions;
DROP POLICY IF EXISTS "makypay_service_update" ON makypay_transactions;

CREATE POLICY "makypay_select_own" 
  ON makypay_transactions FOR SELECT 
  USING (auth.uid() = user_id);

-- Only service role can insert/update (via API routes)
CREATE POLICY "makypay_service_insert" 
  ON makypay_transactions FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "makypay_service_update" 
  ON makypay_transactions FOR UPDATE 
  USING (auth.role() = 'service_role');

-- YoPayments: Same restrictions
DROP POLICY IF EXISTS "yopayments_select_own" ON yopayments_transactions;
DROP POLICY IF EXISTS "yopayments_service_insert" ON yopayments_transactions;
DROP POLICY IF EXISTS "yopayments_service_update" ON yopayments_transactions;

CREATE POLICY "yopayments_select_own" 
  ON yopayments_transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "yopayments_service_insert" 
  ON yopayments_transactions FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "yopayments_service_update" 
  ON yopayments_transactions FOR UPDATE 
  USING (auth.role() = 'service_role');


-- =====================================================
-- 3. SUBSCRIPTIONS - User-Specific Access
-- =====================================================

DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_service_insert" ON subscriptions;

CREATE POLICY "subscriptions_select_own" 
  ON subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_service" 
  ON subscriptions FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

-- Prevent users from updating or deleting subscription records
CREATE POLICY "subscriptions_no_update" 
  ON subscriptions FOR UPDATE 
  USING (false);

CREATE POLICY "subscriptions_no_delete" 
  ON subscriptions FOR DELETE 
  USING (false);


-- =====================================================
-- 4. WATCHLISTS - Prevent Cross-User Access
-- =====================================================

DROP POLICY IF EXISTS "watchlists_select_own" ON watchlists;
DROP POLICY IF EXISTS "watchlists_insert_own" ON watchlists;
DROP POLICY IF EXISTS "watchlists_delete_own" ON watchlists;

CREATE POLICY "watchlists_select_own" 
  ON watchlists FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "watchlists_insert_own" 
  ON watchlists FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "watchlists_update_own" 
  ON watchlists FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "watchlists_delete_own" 
  ON watchlists FOR DELETE 
  USING (auth.uid() = user_id);


-- =====================================================
-- 5. VIEW LOGS - Privacy Protection
-- =====================================================

-- Basic view logs: Only allow inserts, no reads
DROP POLICY IF EXISTS "view_logs_public_insert" ON view_logs;
DROP POLICY IF EXISTS "view_logs_service_role_all" ON view_logs;

CREATE POLICY "view_logs_insert_authenticated" 
  ON view_logs FOR INSERT 
  WITH CHECK (true);

-- Only service role can read view logs (for analytics)
CREATE POLICY "view_logs_service_read" 
  ON view_logs FOR SELECT 
  USING (auth.role() = 'service_role');

-- Enhanced view logs: Users can only see their own
DROP POLICY IF EXISTS "view_logs_enhanced_public_insert" ON view_logs_enhanced;
DROP POLICY IF EXISTS "view_logs_enhanced_select_own" ON view_logs_enhanced;
DROP POLICY IF EXISTS "view_logs_enhanced_service_role_all" ON view_logs_enhanced;

CREATE POLICY "view_logs_enhanced_insert_all" 
  ON view_logs_enhanced FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "view_logs_enhanced_select_own" 
  ON view_logs_enhanced FOR SELECT 
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "view_logs_enhanced_service_all" 
  ON view_logs_enhanced FOR ALL 
  USING (auth.role() = 'service_role');


-- =====================================================
-- 6. ADMIN TABLE - Restrict Access
-- =====================================================

DROP POLICY IF EXISTS "admins_select_own" ON admins;

CREATE POLICY "admins_select_own" 
  ON admins FOR SELECT 
  USING (auth.uid() = user_id);

-- Only service role can manage admins
CREATE POLICY "admins_service_all" 
  ON admins FOR ALL 
  USING (auth.role() = 'service_role');


-- =====================================================
-- 7. CONTENT TABLES - Read-Only for Users
-- =====================================================

-- Movies: Public read, service role write
DROP POLICY IF EXISTS "movies_public_read" ON movies;
DROP POLICY IF EXISTS "movies_service_role_all" ON movies;

CREATE POLICY "movies_public_read" 
  ON movies FOR SELECT 
  USING (published = true OR auth.role() = 'service_role');

CREATE POLICY "movies_service_write" 
  ON movies FOR ALL 
  USING (auth.role() = 'service_role');

-- Series: Same as movies
DROP POLICY IF EXISTS "series_public_read" ON series;
DROP POLICY IF EXISTS "series_service_role_all" ON series;

CREATE POLICY "series_public_read" 
  ON series FOR SELECT 
  USING (published = true OR auth.role() = 'service_role');

CREATE POLICY "series_service_write" 
  ON series FOR ALL 
  USING (auth.role() = 'service_role');

-- Seasons: Same as series
DROP POLICY IF EXISTS "seasons_public_read" ON seasons;
DROP POLICY IF EXISTS "seasons_service_role_all" ON seasons;

CREATE POLICY "seasons_public_read" 
  ON seasons FOR SELECT 
  USING (published = true OR auth.role() = 'service_role');

CREATE POLICY "seasons_service_write" 
  ON seasons FOR ALL 
  USING (auth.role() = 'service_role');

-- Episodes: Same as seasons
DROP POLICY IF EXISTS "episodes_public_read" ON episodes;
DROP POLICY IF EXISTS "episodes_service_role_all" ON episodes;

CREATE POLICY "episodes_public_read" 
  ON episodes FOR SELECT 
  USING (published = true OR auth.role() = 'service_role');

CREATE POLICY "episodes_service_write" 
  ON episodes FOR ALL 
  USING (auth.role() = 'service_role');


-- =====================================================
-- 8. METADATA TABLES - Public Read Only
-- =====================================================

-- Genres
DROP POLICY IF EXISTS "genres_public_read" ON genres;
DROP POLICY IF EXISTS "genres_service_role_all" ON genres;

CREATE POLICY "genres_public_read" 
  ON genres FOR SELECT 
  USING (true);

CREATE POLICY "genres_service_write" 
  ON genres FOR ALL 
  USING (auth.role() = 'service_role');

-- VJs
DROP POLICY IF EXISTS "vjs_public_read" ON vjs;
DROP POLICY IF EXISTS "vjs_service_role_all" ON vjs;

CREATE POLICY "vjs_public_read" 
  ON vjs FOR SELECT 
  USING (true);

CREATE POLICY "vjs_service_write" 
  ON vjs FOR ALL 
  USING (auth.role() = 'service_role');

-- Plans
DROP POLICY IF EXISTS "plans_public_read" ON plans;
DROP POLICY IF EXISTS "plans_service_role_all" ON plans;

CREATE POLICY "plans_public_read" 
  ON plans FOR SELECT 
  USING (active = true OR auth.role() = 'service_role');

CREATE POLICY "plans_service_write" 
  ON plans FOR ALL 
  USING (auth.role() = 'service_role');

-- Notifications
DROP POLICY IF EXISTS "notifications_public_read" ON notifications;
DROP POLICY IF EXISTS "notifications_service_role_all" ON notifications;

CREATE POLICY "notifications_public_read" 
  ON notifications FOR SELECT 
  USING (status = 'sent');

CREATE POLICY "notifications_service_all" 
  ON notifications FOR ALL 
  USING (auth.role() = 'service_role');


-- =====================================================
-- VERIFICATION
-- =====================================================

-- Run this to see all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
