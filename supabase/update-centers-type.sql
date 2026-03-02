-- Update rescue_shelters to add type field with proper values
-- Run this in your Supabase SQL Editor

-- First, ensure the type column exists (it should already)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rescue_shelters' AND column_name = 'type'
    ) THEN
        ALTER TABLE rescue_shelters ADD COLUMN type TEXT;
        RAISE NOTICE 'Added type column to rescue_shelters';
    ELSE
        RAISE NOTICE 'Type column already exists in rescue_shelters';
    END IF;
END $$;

-- Update existing rows to have proper type values based on their names
UPDATE rescue_shelters
SET type = CASE
    WHEN name ILIKE '%hospital%' OR name ILIKE '%medical%' THEN 'hospital'
    WHEN name ILIKE '%fire%' THEN 'fire_station'
    WHEN name ILIKE '%police%' THEN 'police'
    WHEN name ILIKE '%food%' THEN 'food_distribution'
    WHEN name ILIKE '%shelter%' OR name ILIKE '%rescue%' THEN 'shelter'
    WHEN name ILIKE '%medical camp%' THEN 'medical_camp'
    ELSE 'shelter'
END
WHERE type IS NULL OR type = '';

-- Show updated data
SELECT id, name, type, operational_status 
FROM rescue_shelters 
ORDER BY created_at DESC;
