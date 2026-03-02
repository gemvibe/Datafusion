-- Quick Database Diagnostic
-- Run this to verify your tables are set up correctly

-- Check if incidents table exists and show sample data
SELECT 
  'incidents' as table_name,
  COUNT(*) as row_count,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'incidents') as column_count
FROM incidents;

-- Check if rescue_shelters table exists and show sample data
SELECT 
  'rescue_shelters' as table_name,
  COUNT(*) as row_count,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'rescue_shelters') as column_count
FROM rescue_shelters;

-- Check if users table has the new profile columns
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('address', 'latitude', 'longitude', 'landmark', 'profile_completed', 'phone')
ORDER BY column_name;

-- Show sample incident with location data
SELECT 
  id,
  title,
  type,
  urgency,
  status,
  latitude,
  longitude,
  address,
  created_at
FROM incidents
ORDER BY created_at DESC
LIMIT 3;

-- Show active rescue centers
SELECT 
  id,
  name,
  latitude,
  longitude,
  address,
  operational_status
FROM rescue_shelters
WHERE operational_status = 'active'
LIMIT 5;
