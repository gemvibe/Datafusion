'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIncidents: 0,
    totalCenters: 0,
    activeResponders: 0,
    criticalIncidents: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Load statistics
      const [usersCount, incidentsCount, centersCount, criticalCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('incidents').select('*', { count: 'exact', head: true }),
        supabase.from('rescue_shelters').select('*', { count: 'exact', head: true }),
        supabase
          .from('incidents')
          .select('*', { count: 'exact', head: true })
          .eq('urgency', 'critical')
          .eq('status', 'pending'),
      ])

      setStats({
        totalUsers: usersCount.count || 0,
        totalIncidents: incidentsCount.count || 0,
        totalCenters: centersCount.count || 0,
        activeResponders: 0, // Will be calculated later
        criticalIncidents: criticalCount.count || 0,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tamil Nadu Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Complete system overview and management for Tamil Nadu</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : stats.totalUsers}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        {/* Total Incidents */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Incidents</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : stats.totalIncidents}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🚨</span>
            </div>
          </div>
        </div>

        {/* Critical Incidents */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {loading ? '...' : stats.criticalIncidents}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>

        {/* Rescue Shelters */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rescue Shelters</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : stats.totalCenters}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏥</span>
            </div>
          </div>
        </div>

        {/* Active Responders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Responders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : stats.activeResponders}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🚑</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">User Management</h3>
          <p className="text-gray-600 text-sm mb-4">Manage system users and permissions</p>
          <a
            href="/admin/users"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Manage Users →
          </a>
        </div>

        {/* Center Management */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">Rescue Shelters</h3>
          <p className="text-gray-600 text-sm mb-4">Configure rescue shelters and resources</p>
          <a
            href="/admin/centers"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Manage Centers →
          </a>
        </div>
      </div>

      {/* Admin Notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-2">🔐 Administrator Access</h3>
        <p className="text-purple-700 text-sm">
          You have full administrative privileges. You can manage all users, incidents, relief
          centers, and system settings. Use this access responsibly.
        </p>
      </div>
    </div>
  )
}
