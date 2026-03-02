# Middleware-Based Authentication System

## Overview

This project now uses **Next.js Middleware** to handle authentication and role-based routing. The middleware checks every request and redirects users based on their authentication status and role.

## How It Works

### Middleware (`middleware.ts`)

The middleware intercepts requests to protected routes:

1. **Unauthenticated Users**:
   - Accessing `/dashboard/*` or `/admin/*` → Redirected to `/login`

2. **Authenticated Users**:
   - On `/login` or `/signup` → Redirected to their dashboard based on role
   - **Admin role** → Redirected to `/admin`
   - **Other roles** → Redirected to `/dashboard`

3. **Role-Based Access**:
   - Admins accessing `/dashboard/*` → Redirected to `/admin`
   - Non-admins accessing `/admin/*` → Redirected to `/dashboard`

### Protected Routes

- `/dashboard/*` - All authenticated users (except admins)
- `/admin/*` - Only users with `role='admin'`
- `/login` - Public (redirects if authenticated)
- `/signup` - Public (redirects if authenticated)

## Setup Instructions

### 1. Create Test Users in Supabase

Go to your Supabase Dashboard:
https://supabase.com/dashboard/project/fwptmspvyazjbvcnfvsp/auth/users

Click **Add User** and create:

**Admin User:**
- Email: `admin@first72.in`
- Password: `admin123`
- Auto-confirm: ✅ Yes

**Regular User:**
- Email: `user@first72.in`
- Password: `user123`
- Auto-confirm: ✅ Yes

### 2. Set User Roles

Run this SQL in Supabase SQL Editor:

```sql
-- Get user IDs
SELECT id, email FROM auth.users 
WHERE email IN ('admin@first72.in', 'user@first72.in');

-- Insert/update profiles (replace UUIDs with actual IDs from above)
INSERT INTO users (id, email, name, role, is_active) 
VALUES 
  ('YOUR-ADMIN-UUID', 'admin@first72.in', 'TN Admin', 'admin', true),
  ('YOUR-USER-UUID', 'user@first72.in', 'John Doe', 'responder', true)
ON CONFLICT (id) DO UPDATE 
SET role = EXCLUDED.role, name = EXCLUDED.name;

-- Disable RLS for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### 3. Test the Flow

1. **Visit app**: http://localhost:3001
2. **Login as admin**:
   - Email: admin@first72.in
   - Password: admin123
   - ✅ Should redirect to `/admin`

3. **Sign out and login as user**:
   - Email: user@first72.in
   - Password: user123
   - ✅ Should redirect to `/dashboard`

4. **Try accessing wrong routes**:
   - Admin visiting `/dashboard` → Redirected to `/admin`
   - User visiting `/admin` → Redirected to `/dashboard`

## Authentication Flow

```
User visits any page
       ↓
   Middleware checks authentication
       ↓
   ┌─────────────┬─────────────┐
   │             │             │
Not Auth      Auth          Auth
   ↓             ↓             ↓
/login      Check Role    Accessing
            (from DB)     protected
                ↓         route?
         ┌──────┴──────┐     ↓
         │             │    Yes
       Admin         User    ↓
         ↓             ↓     ↓
      /admin      /dashboard Middleware
                              validates
```

## Files Changed

1. **`middleware.ts`** - NEW: Handles all authentication and routing logic
2. **`app/(auth)/login/page.tsx`** - Simple login form
3. **`app/(auth)/signup/page.tsx`** - Simple signup form
4. **`app/page.tsx`** - Redirects to `/login`
5. **`package.json`** - Added `@supabase/ssr` package

## Advantages of Middleware Approach

✅ **Single source of truth** - All auth logic in one place
✅ **Server-side** - Runs before page renders, no flashing
✅ **Automatic** - No need to wrap components with ProtectedRoute
✅ **Efficient** - Checks happen at edge, fast redirects
✅ **Clean code** - Pages don't need auth logic

## Troubleshooting

**Issue**: Infinite redirect loop
- **Solution**: Check middleware matcher is correct
- **Solution**: Verify user profile exists in `users` table

**Issue**: Can't sign in
- **Solution**: Check Supabase credentials in `.env.local`
- **Solution**: Verify user is confirmed in Supabase Auth

**Issue**: Wrong dashboard after login
- **Solution**: Check user's `role` field in `users` table
- **Solution**: Make sure role is exactly 'admin' (lowercase)

## Security Notes

- Middleware runs on edge, checking every request
- Session is verified server-side
- No client-side auth bypass possible
- Role checked from database, not client claims
- RLS can be enabled for production (currently disabled for testing)

## Next Steps (Optional)

- [ ] Enable Row Level Security (RLS)
- [ ] Add password reset functionality
- [ ] Add email verification
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Add session timeout handling
- [ ] Add activity logging

## Test Checklist

- [ ] Unauthenticated user redirected to `/login`
- [ ] Admin login redirects to `/admin`
- [ ] User login redirects to `/dashboard`
- [ ] Admin cannot access `/dashboard`
- [ ] User cannot access `/admin`
- [ ] Signup creates user and redirects to login
- [ ] Sign out works correctly
