-- Sync Auth Users to Users Table
-- Run this in Supabase SQL Editor to create missing user profiles

-- First, check which auth users don't have profiles
SELECT 
    au.id,
    au.email,
    au.created_at as auth_created,
    u.id as profile_exists
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

-- Create profiles for auth users who don't have them
INSERT INTO public.users (id, email, name, role, is_active)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1), 'User') as name,
    COALESCE(au.raw_user_meta_data->>'role', 'responder') as role,
    true as is_active
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify all users now have profiles
SELECT 
    'Total Auth Users' as description,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Total User Profiles' as description,
    COUNT(*) as count
FROM public.users
UNION ALL
SELECT 
    'Auth Users Without Profiles' as description,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

-- Show all user profiles
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.is_active,
    u.created_at
FROM public.users u
ORDER BY u.created_at DESC;
