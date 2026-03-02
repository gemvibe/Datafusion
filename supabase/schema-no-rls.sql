-- First72 Tamil Nadu Database Schema
-- Simplified version without RLS for testing
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS ticket_resources CASCADE;
DROP TABLE IF EXISTS ticket_timeline CASCADE;
DROP TABLE IF EXISTS center_resources CASCADE;
DROP TABLE IF EXISTS dispatch_tickets CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS rescue_shelters CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'command_center', 'responder', 'viewer')),
  rescue_shelter_id UUID,
  team_id UUID,
  is_active BOOLEAN DEFAULT true,
  skills TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rescue Shelters table
CREATE TABLE rescue_shelters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  capacity INTEGER NOT NULL,
  current_load INTEGER DEFAULT 0,
  operational_status TEXT DEFAULT 'active' CHECK (operational_status IN ('active', 'inactive', 'full')),
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Incidents table (MAIN TABLE FOR EMERGENCY REPORTS)
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('flood', 'earthquake', 'cyclone', 'tsunami', 'landslide', 'heatwave')),
  urgency TEXT NOT NULL CHECK (urgency IN ('critical', 'high', 'medium', 'low')),
  urgency_score INTEGER NOT NULL CHECK (urgency_score BETWEEN 1 AND 10),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'en_route', 'on_scene', 'resolved', 'cancelled')),
  
  -- Location
  address TEXT NOT NULL,
  landmark TEXT,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  location_confidence FLOAT CHECK (location_confidence BETWEEN 0 AND 1),
  
  -- People & Source
  people_affected INTEGER DEFAULT 1,
  reported_by TEXT,
  reporter_phone TEXT,
  report_source TEXT NOT NULL CHECK (report_source IN ('manual', 'sms', 'voice', 'social', 'chatbot')),
  
  -- AI Analysis (for future Gemini integration)
  ai_summary TEXT,
  need_types TEXT[],
  ai_confidence FLOAT CHECK (ai_confidence BETWEEN 0 AND 1),
  credibility_score FLOAT CHECK (credibility_score BETWEEN 0 AND 1),
  is_fake_signal BOOLEAN DEFAULT false,
  ai_reasoning TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dispatch Tickets table
CREATE TABLE dispatch_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  assigned_user_id UUID NOT NULL REFERENCES users(id),
  center_id UUID NOT NULL REFERENCES rescue_shelters(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'accepted', 'en_route', 'arrived', 'completed', 'cancelled')),
  priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 10),
  estimated_arrival TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Timeline table
CREATE TABLE ticket_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES dispatch_tickets(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  by_user TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Resources table
CREATE TABLE ticket_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES dispatch_tickets(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL
);

-- Center Resources table
CREATE TABLE center_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_id UUID NOT NULL REFERENCES rescue_shelters(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL
);

-- Chat Sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  incident_id UUID REFERENCES incidents(id),
  escalated BOOLEAN DEFAULT false,
  location TEXT,
  emergency_type TEXT,
  severity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for users -> rescue_shelters
ALTER TABLE users
ADD CONSTRAINT fk_users_rescue_shelter
FOREIGN KEY (rescue_shelter_id) REFERENCES rescue_shelters(id);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_urgency ON incidents(urgency);
CREATE INDEX idx_incidents_type ON incidents(type);
CREATE INDEX idx_incidents_created_at ON incidents(created_at);
CREATE INDEX idx_dispatch_tickets_status ON dispatch_tickets(status);
CREATE INDEX idx_dispatch_tickets_priority ON dispatch_tickets(priority);
CREATE INDEX idx_dispatch_tickets_incident_id ON dispatch_tickets(incident_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dispatch_tickets_updated_at BEFORE UPDATE ON dispatch_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rescue_shelters_updated_at BEFORE UPDATE ON rescue_shelters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NO ROW LEVEL SECURITY (RLS) FOR NOW
-- Since authentication is disabled for testing
-- We'll add RLS policies when auth is re-enabled
-- ============================================

-- Explicitly disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_shelters DISABLE ROW LEVEL SECURITY;
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_timeline DISABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE center_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- Insert sample rescue shelters for Tamil Nadu
INSERT INTO rescue_shelters (name, address, latitude, longitude, capacity, current_load, operational_status, contact_phone, contact_email) VALUES
('Chennai Central Rescue Shelter', 'Anna Salai, Chennai', 13.0827, 80.2707, 500, 0, 'active', '044-28543294', 'chennai@first72.tn.gov.in'),
('Coimbatore District Rescue Shelter', 'Trichy Road, Coimbatore', 11.0168, 76.9558, 300, 0, 'active', '0422-2530796', 'coimbatore@first72.tn.gov.in'),
('Madurai Government Rescue Shelter', 'K. Pudur Main Road, Madurai', 9.9252, 78.1198, 350, 0, 'active', '0452-2530316', 'madurai@first72.tn.gov.in'),
('Trichy Rescue Shelter', 'Rockins Road, Trichy', 10.7905, 78.7047, 250, 0, 'active', '0431-2460644', 'trichy@first72.tn.gov.in'),
('Salem Regional Rescue Shelter', 'Cherry Road, Salem', 11.6643, 78.1460, 200, 0, 'active', '0427-2331655', 'salem@first72.tn.gov.in');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ First72 Tamil Nadu database schema created successfully!';
  RAISE NOTICE '📊 Tables created: users, incidents, rescue_shelters, dispatch_tickets, chat_sessions, chat_messages';
  RAISE NOTICE '🏥 Sample rescue shelters added for Chennai, Coimbatore, Madurai, Trichy, Salem';
  RAISE NOTICE '🚨 Ready to accept emergency reports!';
END $$;
