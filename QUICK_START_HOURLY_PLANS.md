# Quick Start: Hourly Plans

## 1. Run Database Migration

### Option A: Using psql
```bash
psql -U your_user -d your_database -f database/migrations/add_duration_in_hours_to_plans.sql
```

### Option B: Supabase Dashboard
1. Go to **SQL Editor**
2. Copy and paste this:
```sql
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS duration_in_hours INTEGER DEFAULT 0;

UPDATE plans 
SET duration_in_hours = 0 
WHERE duration_in_hours IS NULL;
```
3. Click **Run**

## 2. Create Your First Hourly Plan

1. Go to **Admin Panel** → **Subscription Plans**
2. Click **Add Plan**
3. Fill in:
   ```
   Name: 24 Hour Trial
   Amount: 500
   Hours: 24
   Days: (leave empty or 0)
   Months: (leave empty or 0)
   Duration Label: (leave empty for auto-generation)
   Features: Add any features
   Active: ✓ Yes
   ```
4. Click **Create Plan**

## 3. Test It

1. Make a test payment for the hourly plan
2. Check user profile:
   ```sql
   SELECT 
     subscription,
     subscription_expiry_date,
     EXTRACT(EPOCH FROM (subscription_expiry_date - NOW()))/3600 as hours_remaining
   FROM profiles
   WHERE id = 'your-user-id';
   ```
3. Verify it expires after the specified hours

## Duration Field Priority

When you set multiple duration fields, the system uses:
1. **Hours** (first priority)
2. **Days** (if hours = 0)
3. **Months** (if hours = 0 and days = 0)
4. **30 days** (default if all = 0)

## Common Plans

**24-Hour Trial**: Hours=24, Days=0, Months=0
**Weekly Pass**: Hours=0, Days=7, Months=0
**Monthly Premium**: Hours=0, Days=0, Months=1

## Done! ✅

Your hourly plans are now active. Users can subscribe to plans with hourly durations.

---
For detailed information, see **HOURLY_PLANS_IMPLEMENTATION.md**
