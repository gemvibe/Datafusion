-- Add User Profile Fields for Quick Incident Reporting
-- Run this in Supabase SQL Editor

-- Add address and location fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS latitude FLOAT,
ADD COLUMN IF NOT EXISTS longitude FLOAT,
ADD COLUMN IF NOT EXISTS landmark TEXT,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Create index for faster profile lookups
CREATE INDEX IF NOT EXISTS idx_users_profile_completed ON users(profile_completed);

-- Add comments for documentation
COMMENT ON COLUMN users.address IS 'User default address for quick incident reporting';
COMMENT ON COLUMN users.latitude IS 'User location latitude';
COMMENT ON COLUMN users.longitude IS 'User location longitude';
COMMENT ON COLUMN users.landmark IS 'Nearby landmark for user location';
COMMENT ON COLUMN users.profile_completed IS 'Whether user has completed their profile setup';

-- Query to check user profiles
-- SELECT id, name, email, phone, address, profile_completed FROM users;
