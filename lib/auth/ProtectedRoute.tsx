'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { isAdminEmail } from '@/lib/config/admin-emails'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // AUTH DISABLED FOR TESTING - Remove this to re-enable authentication
  return <>{children}</>
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // No session, redirect to login
        router.push('/login')
        return
      }

      // Check if user's email is in the admin emails list
      const userEmail = session.user.email
      if (!isAdminEmail(userEmail)) {
        // Not an admin email, redirect to regular dashboard
        console.warn('Unauthorized admin access attempt:', userEmail)
        router.push('/dashboard')
        return
      }

      // Additionally verify database role
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role !== 'admin') {
        // Database role doesn't match, redirect to dashboard
        console.warn('User role mismatch for:', userEmail)
        router.push('/dashboard')
        return
      }

      // All checks passed, user is authorized
      setIsAuthorized(true)
    } catch (error) {
      console.error('Admin access check error:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Will redirect, but show nothing while redirecting
  }

  return <>{children}</>
}


