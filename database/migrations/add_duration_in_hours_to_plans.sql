-- Migration: Add duration_in_hours column to plans table
-- Date: 2026-08-05
-- Description: Adds support for hourly duration plans (e.g., 24-hour trial passes)

-- Add the new column
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS duration_in_hours INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN plans.duration_in_hours IS 'Duration of the plan in hours (optional, for short-term plans like trials)';

-- Update existing plans: if they don't have hours set, default to 0
UPDATE plans 
SET duration_in_hours = 0 
WHERE duration_in_hours IS NULL;

-- Example: Create a 24-hour trial plan (optional, uncomment to use)
-- INSERT INTO plans (name, amount, description, duration, duration_in_hours, recommended, sort_order, features, active, allow_downloads)
-- VALUES (
--   '24 Hour Trial',
--   500,
--   'Test our premium features for 24 hours',
--   '24 Hours',
--   24,
--   false,
--   0,
--   ARRAY['HD Streaming', 'All Content Access', 'Ad-Free Experience'],
--   true,
--   false
-- );

-- Verification query (optional, for testing)
-- SELECT id, name, duration, duration_in_hours, duration_in_days, duration_in_months 
-- FROM plans 
-- ORDER BY sort_order, amount;
