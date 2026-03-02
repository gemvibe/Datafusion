'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

type UserRole = 'admin' | 'command_center' | 'responder' | 'viewer'

interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  rescue_shelter_id?: string
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
  isCommandCenter: boolean
  isResponder: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // If user doesn't exist (e.g., Google OAuth first time), create profile
        if (error.code === 'PGRST116') {
          const { data: authUser } = await supabase.auth.getUser()
          if (authUser.user) {
            const newProfile = {
              id: authUser.user.id,
              email: authUser.user.email!,
              name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'User',
              role: 'responder' as UserRole, // Default role for OAuth users
              is_active: true,
            }
            
            const { data: createdProfile, error: createError } = await supabase
              .from('users')
              .insert(newProfile)
              .select()
              .single()

            if (!createError && createdProfile) {
              setProfile(createdProfile)
              setLoading(false)
              return
            }
          }
        }
        throw error
      }
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, name: string, role: UserRole) => {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    })

    if (authError) throw authError

    // Create user profile in database
    if (authData.user) {
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email,
        name,
        role,
        is_active: true,
      })

      if (profileError) throw profileError
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin: profile?.role === 'admin',
    isCommandCenter: profile?.role === 'command_center',
    isResponder: profile?.role === 'responder',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
