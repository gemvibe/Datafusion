# Using Supabase in DataFusion

## 🚀 Quick Reference

### Import the client
```typescript
import { supabase } from '@/lib/supabase/client'
```

## 📝 Common Operations

### 1. Create an Incident
```typescript
const { data, error } = await supabase
  .from('incidents')
  .insert({
    title: 'Medical Emergency',
    description: 'Person collapsed at City Hall',
    type: 'medical',
    urgency: 'critical',
    urgency_score: 10,
    address: '123 Main St',
    latitude: 40.7128,
    longitude: -74.0060,
    people_affected: 1,
    report_source: 'manual'
  })
  .select()
  .single()

if (error) console.error('Error:', error)
else console.log('Created:', data)
```

### 2. Get All Incidents
```typescript
const { data: incidents, error } = await supabase
  .from('incidents')
  .select('*')
  .order('created_at', { ascending: false })

// With filters
const { data: criticalIncidents } = await supabase
  .from('incidents')
  .select('*')
  .eq('urgency', 'critical')
  .eq('status', 'pending')
```

### 3. Get Incident with Related Dispatch Tickets
```typescript
const { data, error } = await supabase
  .from('incidents')
  .select(`
    *,
    dispatch_tickets (
      *,
      assigned_user:users (*),
      center:relief_centers (*)
    )
  `)
  .eq('id', incidentId)
  .single()
```

### 4. Update Incident Status
```typescript
const { data, error } = await supabase
  .from('incidents')
  .update({ status: 'resolved' })
  .eq('id', incidentId)
```

### 5. Create Dispatch Ticket
```typescript
const { data, error } = await supabase
  .from('dispatch_tickets')
  .insert({
    incident_id: incidentId,
    assigned_user_id: userId,
    center_id: centerId,
    priority: 9,
    status: 'assigned'
  })
  .select()
```

### 6. Real-time Subscriptions
```typescript
// Subscribe to new incidents
const channel = supabase
  .channel('incidents')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'incidents'
    },
    (payload) => {
      console.log('New incident:', payload.new)
      // Update your UI
    }
  )
  .subscribe()

// Unsubscribe when component unmounts
return () => {
  supabase.removeChannel(channel)
}
```

### 7. Chat Sessions
```typescript
// Create chat session
const { data: session } = await supabase
  .from('chat_sessions')
  .insert({
    user_id: userId,
    location: 'Downtown',
    emergency_type: 'medical'
  })
  .select()
  .single()

// Add message
const { data: message } = await supabase
  .from('chat_messages')
  .insert({
    session_id: session.id,
    role: 'user',
    content: 'I need help with a medical emergency'
  })
```

### 8. Get Relief Centers by Distance
```typescript
// You'll need to add a PostgreSQL function for this
// Or calculate distance in your application
const { data: centers } = await supabase
  .from('relief_centers')
  .select('*')
  .eq('operational_status', 'active')
  .order('current_load', { ascending: true })
  .limit(5)
```

## 🔐 Authentication (Supabase Auth)

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123',
  options: {
    data: {
      name: 'John Doe',
      role: 'responder'
    }
  }
})
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword123'
})
```

### Get Current User
```typescript
const { data: { user } } = await supabase.auth.getUser()
```

### Sign Out
```typescript
await supabase.auth.signOut()
```

## 📊 Advanced Queries

### Count by Status
```typescript
const { count, error } = await supabase
  .from('incidents')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'pending')
```

### Full-text Search
```typescript
const { data, error } = await supabase
  .from('incidents')
  .select('*')
  .textSearch('description', 'fire AND building', {
    config: 'english'
  })
```

### Date Range
```typescript
const { data, error } = await supabase
  .from('incidents')
  .select('*')
  .gte('created_at', '2026-03-01')
  .lte('created_at', '2026-03-31')
```

## 🎯 Using in API Routes

```typescript
// app/api/incidents/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: Request) {
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('incidents')
    .insert(body)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  
  let query = supabase.from('incidents').select('*')
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data)
}
```

## 🔒 Row Level Security (RLS)

Your database already has RLS enabled. Adjust policies in Supabase Dashboard:

**SQL Editor → New Query:**
```sql
-- Allow users to read their own incidents
CREATE POLICY "Users can read own incidents" ON incidents
  FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to read all incidents
CREATE POLICY "Admins can read all incidents" ON incidents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

## 📱 Real-time Component Example

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function IncidentFeed() {
  const [incidents, setIncidents] = useState([])

  useEffect(() => {
    // Initial fetch
    fetchIncidents()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('public-incidents')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incidents'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setIncidents(prev => [payload.new, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchIncidents() {
    const { data } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    setIncidents(data || [])
  }

  return (
    <div>
      {incidents.map(incident => (
        <div key={incident.id}>{incident.title}</div>
      ))}
    </div>
  )
}
```

## 🎉 You're Ready!

Use these patterns throughout your app. Supabase makes it easy to work with your database directly from Next.js!
