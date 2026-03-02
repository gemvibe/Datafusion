-- Disable Email Confirmation Requirement
-- Run this in Supabase SQL Editor to turn off email verification

-- This script:
-- 1. Confirms all existing unconfirmed users
-- 2. Allows future signups without email confirmation

-- Confirm all existing users who haven't confirmed their email
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- Show confirmed users
SELECT 
    email,
    email_confirmed_at,
    confirmed_at,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Note: To completely disable email confirmation, you also need to:
-- 1. Go to Supabase Dashboard > Authentication > Settings
-- 2. Under "Auth Providers" > Email
-- 3. Toggle OFF "Enable email confirmations"
-- 
-- Or set this in your Supabase project settings:
-- GOTRUE_MAILER_AUTOCONFIRM = true
