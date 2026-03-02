-- ========================================
-- AUTOMATIC USER PROFILE SETUP
-- ========================================
-- This script automatically creates user profiles for auth users
-- No manual UUID copying needed!
--
-- PREREQUISITE: Create auth users in Supabase Dashboard first
-- Go to: Authentication > Users > Add User
--   1. admin@first72.in / admin123
--   2. user@first72.in / user123
-- ========================================

-- Disable email confirmation requirement
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL 
AND email IN ('admin@first72.in', 'user@first72.in');

-- Disable RLS for testing (do this first)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Automatically insert profiles for auth users
INSERT INTO users (id, email, name, role, is_active, phone)
SELECT 
  au.id,
  au.email,
  CASE 
    WHEN au.email = 'admin@first72.in' THEN 'TN Admin'
    WHEN au.email = 'user@first72.in' THEN 'TN User'
    ELSE COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1))
  END as name,
  CASE 
    WHEN au.email = 'admin@first72.in' THEN 'admin'
    ELSE 'user'
  END as role,
  true as is_active,
  CASE 
    WHEN au.email = 'admin@first72.in' THEN '+91-9876543210'
    WHEN au.email = 'user@first72.in' THEN '+91-9876543211'
    ELSE NULL
  END as phone
FROM auth.users au
WHERE au.email IN ('admin@first72.in', 'user@first72.in')
ON CONFLICT (id) DO UPDATE 
SET 
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  is_active = EXCLUDED.is_active,
  phone = EXCLUDED.phone;

-- Verify the setup
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.is_active,
  u.phone,
  au.created_at as auth_created
FROM users u
JOIN auth.users au ON au.id = u.id
WHERE u.email IN ('admin@first72.in', 'user@first72.in')
ORDER BY u.email;

-- Show summary
DO $$
DECLARE
  admin_count INT;
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM users WHERE email = 'admin@first72.in' AND role = 'admin';
  SELECT COUNT(*) INTO user_count FROM users WHERE email = 'user@first72.in' AND role = 'user';
  
  IF admin_count > 0 AND user_count > 0 THEN
    RAISE NOTICE '✅ SUCCESS! User profiles created:';
    RAISE NOTICE '   👤 admin@first72.in (role: admin)';
    RAISE NOTICE '   👤 user@first72.in (role: user)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 You can now login:';
    RAISE NOTICE '   Admin: admin@first72.in / admin123 → /admin';
    RAISE NOTICE '   User: user@first72.in / user123 → /dashboard';
  ELSE
    RAISE WARNING '⚠️  Could not find auth users!';
    RAISE WARNING 'Please create them in Supabase Dashboard first:';
    RAISE WARNING '   Authentication > Users > Add User';
    RAISE WARNING '   1. admin@first72.in / admin123';
    RAISE WARNING '   2. user@first72.in / user123';
  END IF;
END $$;
