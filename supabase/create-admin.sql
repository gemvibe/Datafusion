-- =====================================================
-- DataFusion - Create Admin User Script
-- =====================================================
-- Run this AFTER creating the user through signup
-- This will upgrade a user to admin role
-- =====================================================

-- STEP 1: First, sign up through the web UI at /signup
-- Use these credentials (or your own):
--   Email: admin@datafusion.com
--   Password: admin123
--   Name: Admin User
--   Role: (any, we'll change it next)

-- STEP 2: Then run this SQL in Supabase SQL Editor to make them admin:

UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@datafusion.com';

-- =====================================================
-- Optional: Create demo users
-- =====================================================

-- Demo Responder User
-- (First sign up as: responder@datafusion.com / demo123)
UPDATE users 
SET role = 'responder' 
WHERE email = 'responder@datafusion.com';

-- Demo Command Center User
-- (First sign up as: command@datafusion.com / demo123)
UPDATE users 
SET role = 'command_center' 
WHERE email = 'command@datafusion.com';

-- =====================================================
-- Verify your users
-- =====================================================

SELECT 
    id,
    email,
    name,
    role,
    is_active,
    created_at
FROM users
ORDER BY created_at DESC;

-- =====================================================
-- Quick troubleshooting
-- =====================================================

-- Check if user exists:
SELECT * FROM users WHERE email = 'your-email@example.com';

-- Activate a user:
UPDATE users SET is_active = true WHERE email = 'your-email@example.com';

-- Change user role:
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- Delete a user (if needed):
-- DELETE FROM users WHERE email = 'your-email@example.com';
