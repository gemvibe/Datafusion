-- DataFusion Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  relief_center_id UUID,
  team_id UUID,
  is_active BOOLEAN DEFAULT true,
  skills TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relief Centers table
CREATE TABLE relief_centers (
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

-- Incidents table
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('medical', 'fire', 'flood', 'earthquake', 'accident', 'violence', 'missing_person', 'other')),
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
  
  -- AI Analysis
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
  center_id UUID NOT NULL REFERENCES relief_centers(id),
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
  center_id UUID NOT NULL REFERENCES relief_centers(id) ON DELETE CASCADE,
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

-- Add foreign key for users -> relief_centers
ALTER TABLE users
ADD CONSTRAINT fk_users_relief_center
FOREIGN KEY (relief_center_id) REFERENCES relief_centers(id);

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

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE relief_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies (example - adjust based on your needs)
-- Allow authenticated users to read incidents
CREATE POLICY "Users can view incidents" ON incidents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to create incidents
CREATE POLICY "Users can create incidents" ON incidents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow admins to update incidents
CREATE POLICY "Admins can update incidents" ON incidents
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

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

CREATE TRIGGER update_relief_centers_updated_at BEFORE UPDATE ON relief_centers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
