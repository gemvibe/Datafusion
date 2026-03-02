-- ═══════════════════════════════════════════════════════════════
-- UPDATE DATABASE TO NATURAL DISASTERS ONLY
-- Run this in Supabase SQL Editor to update existing database
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Delete incidents that are NOT natural disasters
DELETE FROM incidents WHERE type NOT IN ('flood', 'earthquake');

-- Step 2: Drop the old constraint
ALTER TABLE incidents DROP CONSTRAINT IF EXISTS incidents_type_check;

-- Step 3: Add new constraint with only natural disaster types
ALTER TABLE incidents
ADD CONSTRAINT incidents_type_check 
CHECK (type IN ('flood', 'earthquake', 'cyclone', 'tsunami', 'landslide', 'heatwave'));

-- Step 4: Verify the changes
SELECT 
  COUNT(*) as total_incidents,
  type,
  COUNT(*) as count_per_type
FROM incidents
GROUP BY type
ORDER BY type;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database updated to natural disasters only!';
  RAISE NOTICE '📊 Allowed types: flood, earthquake, cyclone, tsunami, landslide, heatwave';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Note: Old non-disaster incidents have been deleted';
  RAISE NOTICE '💡 You can now run populate-sample-data.sql to add sample disaster reports';
END $$;
