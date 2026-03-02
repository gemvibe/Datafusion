-- ═══════════════════════════════════════════════════════════════
-- POPULATE SAMPLE DATA FOR TESTING
-- Run this in Supabase SQL Editor to add relief centers and test incidents
-- ═══════════════════════════════════════════════════════════════

-- Clear existing data (optional - uncomment if you want fresh start)
-- TRUNCATE incidents, dispatch_tickets, center_resources, ticket_resources, ticket_timeline, chat_messages, chat_sessions CASCADE;
-- TRUNCATE relief_centers CASCADE;
-- TRUNCATE users CASCADE;

-- Insert sample relief centers for Tamil Nadu
INSERT INTO relief_centers (name, address, latitude, longitude, capacity, current_load, operational_status, contact_phone, contact_email) VALUES
('Chennai Central Emergency Hub', 'Anna Salai, Chennai', 13.0827, 80.2707, 500, 0, 'active', '044-28521144', 'chennai@first72.tn.gov.in'),
('Coimbatore District Relief Center', 'Trichy Road, Coimbatore', 11.0168, 76.9558, 300, 0, 'active', '0422-2530796', 'coimbatore@first72.tn.gov.in'),
('Madurai Government Relief Center', 'K. Pudur Main Road, Madurai', 9.9252, 78.1198, 350, 0, 'active', '0452-2530316', 'madurai@first72.tn.gov.in'),
('Trichy Relief Center', 'Rockins Road, Trichy', 10.7905, 78.7047, 250, 0, 'active', '0431-2460644', 'trichy@first72.tn.gov.in'),
('Salem Regional Relief Center', 'Cherry Road, Salem', 11.6643, 78.1460, 200, 0, 'active', '0427-2331655', 'salem@first72.tn.gov.in')
ON CONFLICT DO NOTHING;

-- Insert sample test incidents
INSERT INTO incidents (title, description, type, urgency, urgency_score, status, address, latitude, longitude, people_affected, report_source) VALUES
('Heavy Flood - Marina Beach Area', 'Flash flooding reported with rapidly rising water levels at Marina Beach', 'flood', 'critical', 10, 'pending', 'Marina Beach, Chennai', 13.0499, 80.2824, 50, 'manual'),
('Earthquake Tremors Felt', 'Moderate earthquake tremors reported, some building cracks observed', 'earthquake', 'high', 8, 'pending', 'T Nagar, Chennai', 13.0418, 80.2341, 200, 'voice'),
('Cyclone Warning - Coastal Areas', 'Strong winds and heavy rain due to approaching cyclone', 'cyclone', 'high', 9, 'pending', 'Velachery, Chennai', 12.9750, 80.2200, 100, 'social'),
('Landslide Alert - Hill Area', 'Landslide reported blocking main road, several families evacuated', 'landslide', 'high', 8, 'assigned', 'Ooty Hills Road', 11.4102, 76.6950, 30, 'manual'),
('Severe Heatwave Conditions', 'Extreme heat conditions reported, multiple heat exhaustion cases', 'heatwave', 'medium', 6, 'pending', 'Madurai City', 9.9252, 78.1198, 500, 'manual')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
DECLARE
  incident_count INTEGER;
  center_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO incident_count FROM incidents;
  SELECT COUNT(*) INTO center_count FROM rescue_shelters;
  
  RAISE NOTICE '✅ Sample data populated successfully!';
  RAISE NOTICE '🚨 Incidents: %', incident_count;
  RAISE NOTICE '🏥 Rescue Shelters: %', center_count;
  RAISE NOTICE '';
  RAISE NOTICE '🌐 Refresh your browser to see the data!';
END $$;
