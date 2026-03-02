# 🚨 EMERGENCY SETUP REQUIRED

## Error: "Failed to submit report"

This error occurs because the database tables haven't been created yet. Follow these steps:

## Step 1: Check Environment Variables

Make sure you have a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fwptmspvyazjbvcnfvsp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
GOOGLE_GEMINI_API_KEY=your_gemini_key_here
```

### How to get Supabase keys:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Create Database Tables

1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire contents of `supabase/schema.sql`
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. Wait for "Success" message

## Step 3: Verify Tables Created

1. In Supabase, go to **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ users
   - ✅ incidents
   - ✅ rescue_shelters
   - ✅ dispatch_tickets
   - ✅ chat_sessions
   - ✅ chat_messages

## Step 4: Restart Dev Server

After creating tables:
```bash
# Stop the server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

## Step 5: Test Again

1. Open http://localhost:3000/incidents/new
2. Fill out the emergency report form
3. Submit
4. You should see: "✅ Emergency report submitted successfully!"
5. Check admin page: http://localhost:3000/admin/incidents

---

## Quick Test (Manual Insert)

If you want to test if the database is working, try inserting a test record in Supabase:

1. Go to Supabase → **Table Editor** → **incidents**
2. Click **Insert row**
3. Fill in:
   ```
   title: "Test Emergency"
   description: "This is a test"
   type: "medical"
   urgency: "high"
   urgency_score: 8
   status: "pending"
   address: "Chennai"
   latitude: 13.0827
   longitude: 80.2707
   reported_by: "Test User"
   reporter_phone: "9876543210"
   report_source: "manual"
   ```
4. Click **Save**
5. Open http://localhost:3000/admin/incidents
6. You should see your test incident!

---

## Still Having Issues?

**Check browser console:**
1. Press F12 in your browser
2. Go to **Console** tab
3. Try submitting again
4. Look for error messages (they will be red)
5. Share the error message for more specific help

**Common errors:**
- "relation incidents does not exist" → Run schema.sql
- "Missing environment variables" → Create .env.local
- "401 Unauthorized" → Check your Supabase keys
- "Network error" → Check if Supabase project is active
