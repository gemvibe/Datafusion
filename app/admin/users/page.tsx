'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type UserRole = 'admin' | 'command_center' | 'responder' | 'viewer'

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<UserRole | 'all'>('all')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        throw new Error(supabaseError.message || 'Failed to load users')
      }
      
      setUsers(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users'
      console.error('Error loading users:', errorMessage)
      setError(errorMessage)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId)

      if (error) throw error
      
      // Reload users
      loadUsers()
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(user => user.role === filter)

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'command_center': return 'bg-blue-100 text-blue-800'
      case 'responder': return 'bg-green-100 text-green-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tamil Nadu User Management</h1>
          <p className="text-gray-600 mt-1">Manage Tamil Nadu system users and their permissions</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <div className="font-bold text-yellow-900 mb-1">Database Connection Issue</div>
              <div className="text-sm text-yellow-800 mb-2">{error}</div>
              <div className="text-xs text-yellow-700 bg-yellow-100 p-3 rounded border border-yellow-300">
                <div className="font-semibold mb-1">📝 Possible solutions:</div>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Verify users table exists in Supabase</li>
                  <li>Check RLS policies allow reading from users table</li>
                  <li>Run <code className="bg-yellow-200 px-1 rounded">supabase/schema.sql</code> to create tables</li>
                  <li>Or run <code className="bg-yellow-200 px-1 rounded">supabase/disable-rls.sql</code> to disable RLS for testing</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Admins</p>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.role === 'admin').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Responders</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter(u => u.role === 'responder').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.is_active).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Filter by role:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('admin')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setFilter('command_center')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'command_center' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Command Center
          </button>
          <button
            onClick={() => setFilter('responder')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'responder' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Responder
          </button>
          <button
            onClick={() => setFilter('viewer')}
            className={`px-3 py-1 text-sm rounded ${
              filter === 'viewer' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Viewer
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      className={`${
                        user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
