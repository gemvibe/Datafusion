-- Create Test Users for Login System
-- Run this in your Supabase SQL Editor

-- Note: These users need to be created in Supabase Auth first
-- Go to: Authentication > Users > Add User (manually)
-- Or use the Supabase dashboard to invite users

-- For now, this script just ensures the users table has the right structure
-- and provides sample data structure

-- Sample user data that should be added via Supabase Auth:
-- 1. Admin User:
--    Email: admin@first72.in
--    Password: admin123
--    
-- 2. Regular User:
--    Email: user@first72.in
--    Password: user123

-- After creating users in Supabase Auth, their profiles will be auto-created
-- But you can also manually insert profiles if needed:

DO $$
BEGIN
  RAISE NOTICE '⚠️  To create test users:';
  RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
  RAISE NOTICE '2. Click "Add User" and create:';
  RAISE NOTICE '   - admin@first72.in (password: admin123)';
  RAISE NOTICE '   - user@first72.in (password: user123)';
  RAISE NOTICE '3. After auth users are created, run the profile insert below';
  RAISE NOTICE '';
  RAISE NOTICE '📝 The users table will be populated automatically via AuthContext';
  RAISE NOTICE '   when users first sign in, or you can manually insert profiles';
END $$;

-- Example: If you have the user IDs from Supabase Auth, you can insert profiles:
-- Replace 'YOUR-UUID-HERE' with actual UUIDs from Supabase Auth

-- INSERT INTO users (id, email, name, role, is_active) 
-- VALUES 
--   ('YOUR-ADMIN-UUID-HERE', 'admin@first72.in', 'TN Admin', 'admin', true),
--   ('YOUR-USER-UUID-HERE', 'user@first72.in', 'John Doe', 'responder', true)
-- ON CONFLICT (id) DO UPDATE 
-- SET role = EXCLUDED.role, name = EXCLUDED.name;

-- Make sure RLS is disabled for users table (for testing)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Show current users
SELECT id, email, name, role, is_active, created_at 
FROM users 
ORDER BY created_at DESC;
