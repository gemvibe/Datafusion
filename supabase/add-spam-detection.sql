-- Add spam detection fields to incidents table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/fwptmspvyazjbvcnfvsp/sql/new

ALTER TABLE incidents 
ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS spam_score DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS spam_reason TEXT,
ADD COLUMN IF NOT EXISTS spam_checked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS manual_review_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS weather_validated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS weather_matches BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS weather_data JSONB;

-- Create index for faster spam filtering
CREATE INDEX IF NOT EXISTS idx_incidents_spam ON incidents(is_spam);
CREATE INDEX IF NOT EXISTS idx_incidents_spam_checked ON incidents(spam_checked_at);
CREATE INDEX IF NOT EXISTS idx_incidents_review_status ON incidents(manual_review_status);
CREATE INDEX IF NOT EXISTS idx_incidents_weather_validated ON incidents(weather_validated);

-- Add comment for documentation
COMMENT ON COLUMN incidents.is_spam IS 'Whether the incident report is detected as spam';
COMMENT ON COLUMN incidents.spam_score IS 'AI confidence score (0-100) that this is spam';
COMMENT ON COLUMN incidents.spam_reason IS 'AI explanation for spam classification';
COMMENT ON COLUMN incidents.spam_checked_at IS 'Timestamp when spam check was performed';
COMMENT ON COLUMN incidents.manual_review_status IS 'Status: pending, verified_spam, verified_legitimate, needs_review';
COMMENT ON COLUMN incidents.reviewed_by IS 'Admin user who manually reviewed this report';
COMMENT ON COLUMN incidents.reviewed_at IS 'Timestamp of manual review';
COMMENT ON COLUMN incidents.weather_validated IS 'Whether weather validation was performed';
COMMENT ON COLUMN incidents.weather_matches IS 'Whether disaster type matches current weather conditions';
COMMENT ON COLUMN incidents.weather_data IS 'Weather data from OpenWeatherMap API (JSON)';

-- Query to view spam reports
-- SELECT id, type, address, description, is_spam, spam_score, spam_reason
-- FROM incidents 
-- WHERE is_spam = true 
-- ORDER BY spam_score DESC;

-- Query to view borderline cases (needs manual review)
-- SELECT id, type, address, description, spam_score, spam_reason
-- FROM incidents 
-- WHERE spam_score BETWEEN 40 AND 60
-- ORDER BY spam_score;

-- Query to view unchecked reports
-- SELECT id, type, address, description, created_at
-- FROM incidents 
-- WHERE spam_checked_at IS NULL
-- ORDER BY created_at DESC;
