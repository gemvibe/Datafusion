'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Get user profile to determine where to redirect
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        // If profile doesn't exist, create it with default role
        if (profileError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              name: data.user.email?.split('@')[0] || 'User',
              role: 'responder',
              is_active: true,
            })

          if (insertError) {
            console.error('Error creating profile:', insertError)
            setError('Profile creation failed. Please contact support.')
            setLoading(false)
            return
          }
          
          // Default to dashboard for newly created responder profile
          router.push('/dashboard')
          return
        } else {
          throw profileError
        }
      }

      // Redirect based on role
      if (profile?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="text-4xl mr-2">⚡</span>
            Hope Link
          </h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

