-- Migration Script: Simplify Roles to Two-Tier System
-- Run this in Supabase SQL Editor to migrate existing data

-- Step 1: Drop the old constraint first (allows us to update to 'user' role)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Step 2: Update existing user roles
-- Map command_center, responder, and viewer to 'user'
UPDATE users
SET role = CASE
  WHEN role IN ('command_center', 'responder', 'viewer') THEN 'user'
  WHEN role = 'admin' THEN 'admin'
  ELSE 'user'
END
WHERE role NOT IN ('admin', 'user');

-- Step 3: Add the new constraint with only admin and user
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'user'));

-- Step 4: Update the default value
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';

-- Step 5: Verify the migration
SELECT 
  role,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM users
GROUP BY role
ORDER BY count DESC;

-- Show summary
DO $$
DECLARE
  admin_count INT;
  user_count INT;
  total_count INT;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin';
  SELECT COUNT(*) INTO user_count FROM users WHERE role = 'user';
  SELECT COUNT(*) INTO total_count FROM users;
  
  RAISE NOTICE '✅ Role migration completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary:';
  RAISE NOTICE '   Total Users: %', total_count;
  RAISE NOTICE '   👑 Admins: %', admin_count;
  RAISE NOTICE '   👤 Users: %', user_count;
  RAISE NOTICE '';
  RAISE NOTICE '✨ The system now uses a simplified two-tier role system:';
  RAISE NOTICE '   • admin - Full system access';
  RAISE NOTICE '   • user - Standard user access';
END $$;
