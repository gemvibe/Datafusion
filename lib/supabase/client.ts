import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only log warnings during build, don't throw errors
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  Supabase environment variables missing!')
    console.warn('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
    console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
  }
} else {
  console.log('✅ Supabase client initialized:', supabaseUrl)
}

// Use placeholder values during build if env vars not available
const url = supabaseUrl || 'https://placeholder.supabase.co'
const anonKey = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Server-side client with service role (for admin operations)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = serviceRoleKey
  ? createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase // Fallback to regular client if service role key not available
