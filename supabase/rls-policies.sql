-- ═══════════════════════════════════════════════════════════════
-- COMPREHENSIVE ROW LEVEL SECURITY (RLS) POLICIES
-- DataFusion - Disaster Management Platform
-- ═══════════════════════════════════════════════════════════════

-- ===================================================================
-- INCIDENTS POLICIES
-- ===================================================================

-- Anyone can view incidents (for public emergency awareness)
CREATE POLICY "Public can view incidents" ON incidents
  FOR SELECT USING (true);

-- Authenticated users can create incidents
CREATE POLICY "Authenticated users can create incidents" ON incidents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update/delete incidents (role checks done in app layer)
CREATE POLICY "Authenticated users can update incidents" ON incidents
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete incidents" ON incidents
  FOR DELETE USING (auth.role() = 'authenticated');

-- ===================================================================
-- USERS POLICIES
-- ===================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow authenticated users to insert their profile during signup
CREATE POLICY "Users can create own profile" ON users
  FOR INSERT WITH CHECK (
    auth.uid() = id 
    OR auth.role() = 'authenticated'  -- Allow any authenticated user to create profile
  );

-- Users can update their own profile (but not their role)
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM users WHERE id = auth.uid())  -- Prevent role escalation
  );

-- ===================================================================
-- DISPATCH TICKETS POLICIES
-- ===================================================================

-- Authenticated users can view tickets (assigned to them or their role allows)
CREATE POLICY "Users can view dispatch tickets" ON dispatch_tickets
  FOR SELECT USING (
    assigned_user_id = auth.uid()
    OR auth.role() = 'authenticated'  -- All authenticated users can view
  );

-- Authenticated users can create tickets (role checks in app)
CREATE POLICY "Authenticated users can create tickets" ON dispatch_tickets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update tickets (role/assignment checks in app)
CREATE POLICY "Authenticated users can update tickets" ON dispatch_tickets
  FOR UPDATE USING (
    assigned_user_id = auth.uid()
    OR auth.role() = 'authenticated'
  );

-- ===================================================================
-- RELIEF CENTERS POLICIES
-- ===================================================================

-- Everyone can view relief centers (public info)
CREATE POLICY "Public can view relief centers" ON relief_centers
  FOR SELECT USING (true);

-- Authenticated users can manage centers (role checks in app)
CREATE POLICY "Authenticated users can manage relief centers" ON relief_centers
  FOR ALL USING (auth.role() = 'authenticated');

-- ===================================================================
-- CHAT SESSIONS POLICIES
-- ===================================================================

-- Users can view their own chat sessions or anonymous sessions
CREATE POLICY "Users can view chat sessions" ON chat_sessions
  FOR SELECT USING (
    user_id = auth.uid()
    OR user_id IS NULL  -- Allow anonymous
    OR auth.role() = 'authenticated'  -- All authenticated users can view
  );

-- Anyone can create chat sessions (for emergency help)
CREATE POLICY "Anyone can create chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (true);

-- Users can update their own sessions
CREATE POLICY "Users can update own chat sessions" ON chat_sessions
  FOR UPDATE USING (
    user_id = auth.uid()
    OR user_id IS NULL
    OR auth.role() = 'authenticated'
  );

-- ===================================================================
-- CHAT MESSAGES POLICIES
-- ===================================================================

-- Users can view messages in sessions
CREATE POLICY "Users can view chat messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = session_id
      AND (chat_sessions.user_id = auth.uid() OR chat_sessions.user_id IS NULL)
    )
    OR auth.role() = 'authenticated'  -- All authenticated users can view
  );

-- Anyone can create messages (for emergency chat)
CREATE POLICY "Anyone can create chat messages" ON chat_messages
  FOR INSERT WITH CHECK (true);

-- ===================================================================
-- TICKET TIMELINE POLICIES
-- ===================================================================

-- Authenticated users can view timeline
CREATE POLICY "View ticket timeline" ON ticket_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM dispatch_tickets
      WHERE dispatch_tickets.id = ticket_id
      AND (dispatch_tickets.assigned_user_id = auth.uid() OR auth.role() = 'authenticated')
    )
  );

-- Authenticated users can create timeline entries
CREATE POLICY "Create ticket timeline" ON ticket_timeline
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ===================================================================
-- RESOURCES POLICIES
-- ===================================================================

-- Everyone can view resources
CREATE POLICY "Public can view ticket resources" ON ticket_resources
  FOR SELECT USING (true);

CREATE POLICY "Public can view center resources" ON center_resources
  FOR SELECT USING (true);

-- Authenticated users can manage resources (role checks in app)
CREATE POLICY "Authenticated users can manage ticket resources" ON ticket_resources
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage center resources" ON center_resources
  FOR ALL USING (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════
-- AUTHORIZATION NOTES
-- ═══════════════════════════════════════════════════════════════
--
-- Role-based authorization (admin, command_center, responder) should be
-- handled in the application layer by:
-- 1. Checking user role from the users table after authentication
-- 2. Using conditional logic in frontend/backend to restrict actions
-- 3. For admin operations, use Supabase service role key (bypasses RLS)
--
-- This approach avoids infinite recursion in RLS policies while
-- maintaining security through application-level checks.
--

-- ═══════════════════════════════════════════════════════════════
-- NOTES & IMPLEMENTATION GUIDE
-- ═══════════════════════════════════════════════════════════════
-- 
-- PUBLIC ACCESS (true):
-- - Incidents (anyone can see emergencies)
-- - Relief Centers (public info)
-- - Chat Sessions & Messages (for emergency help)
-- 
-- AUTHENTICATED ACCESS:
-- - Users can view/update their own profiles
-- - Basic CRUD operations for authenticated users
-- - Role-based restrictions enforced in application layer
--
-- IMPLEMENTATION:
-- 1. After user signs in, fetch their profile from users table
-- 2. Check user.role in your app code before sensitive operations
-- 3. For admin operations (user management, etc.), consider using
--    service role key which bypasses RLS entirely
--
-- SETUP STEPS:
-- 1. Run schema.sql first to create tables
-- 2. Run this file (rls-policies.sql) to enable RLS
-- 3. Create your admin user via signup
-- 4. Verify authentication flow works
--
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- AUTO-CREATE USER PROFILE TRIGGER
-- ═══════════════════════════════════════════════════════════════

-- Function to automatically create user profile when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'responder')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function after user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
