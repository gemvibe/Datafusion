-- ═══════════════════════════════════════════════════════════════
-- DROP ALL EXISTING POLICIES (Run this FIRST)
-- ═══════════════════════════════════════════════════════════════

-- Drop Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Users can create own profile" ON users;

-- Drop Incidents policies
DROP POLICY IF EXISTS "Public can view incidents" ON incidents;
DROP POLICY IF EXISTS "Authenticated users can create incidents" ON incidents;
DROP POLICY IF EXISTS "Admins and command center can update incidents" ON incidents;
DROP POLICY IF EXISTS "Admins can delete incidents" ON incidents;
DROP POLICY IF EXISTS "Authenticated users can update incidents" ON incidents;
DROP POLICY IF EXISTS "Authenticated users can delete incidents" ON incidents;

-- Drop Dispatch Tickets policies
DROP POLICY IF EXISTS "Responders can view assigned tickets" ON dispatch_tickets;
DROP POLICY IF EXISTS "Command center can create tickets" ON dispatch_tickets;
DROP POLICY IF EXISTS "Responders can update assigned tickets" ON dispatch_tickets;
DROP POLICY IF EXISTS "Users can view dispatch tickets" ON dispatch_tickets;
DROP POLICY IF EXISTS "Authenticated users can create tickets" ON dispatch_tickets;
DROP POLICY IF EXISTS "Authenticated users can update tickets" ON dispatch_tickets;

-- Drop Rescue Shelters policies
DROP POLICY IF EXISTS "Public can view rescue shelters" ON rescue_shelters;
DROP POLICY IF EXISTS "Admins can manage rescue shelters" ON rescue_shelters;
DROP POLICY IF EXISTS "Authenticated users can manage rescue shelters" ON rescue_shelters;

-- Drop Chat Sessions policies
DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Anyone can create chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can view chat sessions" ON chat_sessions;

-- Drop Chat Messages policies
DROP POLICY IF EXISTS "Users can view own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can create chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can view chat messages" ON chat_messages;

-- Drop Ticket Timeline policies
DROP POLICY IF EXISTS "View ticket timeline" ON ticket_timeline;
DROP POLICY IF EXISTS "Create ticket timeline" ON ticket_timeline;

-- Drop Resources policies
DROP POLICY IF EXISTS "Public can view ticket resources" ON ticket_resources;
DROP POLICY IF EXISTS "Public can view center resources" ON center_resources;
DROP POLICY IF EXISTS "Admins can manage ticket resources" ON ticket_resources;
DROP POLICY IF EXISTS "Admins can manage center resources" ON center_resources;
DROP POLICY IF EXISTS "Authenticated users can manage ticket resources" ON ticket_resources;
DROP POLICY IF EXISTS "Authenticated users can manage center resources" ON center_resources;

-- Drop helper functions if they exist
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_command_center_or_admin();
DROP FUNCTION IF EXISTS is_responder();

-- Note: RLS remains enabled on the tables, we're just dropping the old policies
