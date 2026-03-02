-- Check and Create Rescue Shelters Table
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop rescue_shelters if it exists (to recreate with correct structure)
DROP TABLE IF EXISTS rescue_shelters CASCADE;

-- Create rescue_shelters table
CREATE TABLE rescue_shelters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT,
  address TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  current_load INTEGER DEFAULT 0,
  operational_status TEXT DEFAULT 'active' CHECK (operational_status IN ('active', 'inactive', 'full')),
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for testing
ALTER TABLE rescue_shelters DISABLE ROW LEVEL SECURITY;

-- Insert sample data
INSERT INTO rescue_shelters (name, type, address, latitude, longitude, capacity, current_load, operational_status, contact_phone, contact_email) VALUES
('Central Relief Center', 'shelter', '123 Main St, City Center', 13.0827, 80.2707, 500, 320, 'active', '+91-44-12345678', 'central@relief.org'),
('North Emergency Hospital', 'hospital', '456 North Ave, North District', 13.1000, 80.2500, 300, 280, 'active', '+91-44-23456789', 'north@hospital.org'),
('South Fire Station', 'fire_station', '789 South Rd, South Zone', 13.0500, 80.2900, 50, 15, 'active', '+91-44-34567890', 'south@fire.gov'),
('East Medical Camp', 'medical_camp', '321 East Blvd, East District', 13.0900, 80.3100, 200, 85, 'active', '+91-44-45678901', 'east@medical.org'),
('West Food Distribution Center', 'food_distribution', '654 West St, West Area', 13.0700, 80.2400, 400, 150, 'active', '+91-44-56789012', 'west@food.org');

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rescue_shelters_updated_at 
BEFORE UPDATE ON rescue_shelters
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Show result
DO $$
BEGIN
  RAISE NOTICE '✅ rescue_shelters table created successfully with sample data';
END $$;
