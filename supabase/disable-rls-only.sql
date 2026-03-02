-- Quick script to disable RLS on all tables
-- Run this in Supabase SQL Editor if you have existing data you want to keep
-- This won't delete any data, just removes RLS restrictions

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_shelters DISABLE ROW LEVEL SECURITY;
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_timeline DISABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE center_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- Confirmation message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS disabled on all tables!';
  RAISE NOTICE '🔓 All operations should now work without permission errors';
END $$;
