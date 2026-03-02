-- ═══════════════════════════════════════════════════════════════
-- DISABLE RLS FOR TESTING
-- Run this in Supabase SQL Editor to allow unrestricted access
-- ═══════════════════════════════════════════════════════════════

-- First, drop all existing policies
DROP POLICY IF EXISTS "Public can view incidents" ON incidents;
DROP POLICY IF EXISTS "Authenticated users can create incidents" ON incidents;
DROP POLICY IF EXISTS "Authenticated users can update incidents" ON incidents;
DROP POLICY IF EXISTS "Authenticated users can delete incidents" ON incidents;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view dispatch tickets" ON dispatch_tickets;
DROP POLICY IF EXISTS "Authenticated users can create tickets" ON dispatch_tickets;
DROP POLICY IF EXISTS "Authenticated users can update tickets" ON dispatch_tickets;
DROP POLICY IF EXISTS "Public can view rescue shelters" ON rescue_shelters;
DROP POLICY IF EXISTS "Authenticated users can manage rescue shelters" ON rescue_shelters;
DROP POLICY IF EXISTS "Users can view chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Anyone can create chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can view chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can create chat messages" ON chat_messages;
DROP POLICY IF EXISTS "View ticket timeline" ON ticket_timeline;
DROP POLICY IF EXISTS "Create ticket timeline" ON ticket_timeline;
DROP POLICY IF EXISTS "Public can view ticket resources" ON ticket_resources;
DROP POLICY IF EXISTS "Public can view center resources" ON center_resources;

-- Now disable RLS on all tables
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_shelters DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_timeline DISABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE center_resources DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'incidents', 
    'users', 
    'dispatch_tickets', 
    'rescue_shelters',
    'chat_sessions',
    'chat_messages',
    'ticket_timeline',
    'ticket_resources',
    'center_resources'
  )
ORDER BY tablename;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS has been DISABLED on all tables';
  RAISE NOTICE '⚠️  WARNING: This is for TESTING only!';
  RAISE NOTICE '🔓 All data is now publicly accessible';
  RAISE NOTICE '';
  RAISE NOTICE '📝 To re-enable RLS later, run: rls-policies.sql';
END $$;
