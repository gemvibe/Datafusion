'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTheme } from '@/lib/theme/ThemeProvider'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIncidents: 0,
    totalCenters: 0,
    activeResponders: 0,
    criticalIncidents: 0,
  })
  const [loading, setLoading] = useState(true)
  const { theme, toggleTheme } = useTheme()

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
        activeResponders: 0,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tamil Nadu Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Complete system oversight and management for Tamil Nadu</p>
        </div>
        
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-3 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <span className="text-2xl">☀️</span>
          ) : (
            <span className="text-2xl">🌙</span>
          )}
        </button>
      </div>

      {/* Stats Grid - Kanban Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 transition-colors duration-200">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Total Users</h3>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {loading ? '...' : stats.totalUsers}
            </div>
            <div className="text-4xl">👥</div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Registered system users</p>
        </div>

        {/* Total Incidents */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 transition-colors duration-200">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Total Incidents</h3>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {loading ? '...' : stats.totalIncidents}
            </div>
            <div className="text-4xl">🚨</div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {stats.criticalIncidents} critical pending
          </p>
        </div>

        {/* Rescue Shelters */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 transition-colors duration-200">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Rescue Shelters</h3>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {loading ? '...' : stats.totalCenters}
            </div>
            <div className="text-4xl">🏥</div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Active relief centers</p>
        </div>

        {/* Active Responders */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 transition-colors duration-200">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Active Teams</h3>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {loading ? '...' : stats.activeResponders}
            </div>
            <div className="text-4xl">🚑</div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Response teams on duty</p>
        </div>
      </div>

      {/* Admin Features */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors duration-200">
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Admin Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">👥</span>
            <div>
              <div className="font-medium dark:text-gray-100">User Management</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Manage system users and roles</div>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">🏥</span>
            <div>
              <div className="font-medium dark:text-gray-100">Center Configuration</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Configure rescue shelters and resources</div>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">🗺️</span>
            <div>
              <div className="font-medium dark:text-gray-100">Map Management</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Control map layers and visualizations</div>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">📊</span>
            <div>
              <div className="font-medium dark:text-gray-100">System Analytics</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">View detailed reports and insights</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-3xl">👥</div>
            <div>
              <h3 className="text-lg font-semibold dark:text-gray-100">User Management</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Manage system users and permissions
              </p>
            </div>
          </div>
          <a
            href="/admin/users"
            className="inline-block w-full text-center bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Manage Users →
          </a>
        </div>

        {/* Center Management */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-3xl">🏥</div>
            <div>
              <h3 className="text-lg font-semibold dark:text-gray-100">Rescue Shelters</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Configure rescue shelters and resources
              </p>
            </div>
          </div>
          <a
            href="/admin/centers"
            className="inline-block w-full text-center bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
          >
            Manage Centers →
          </a>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 transition-colors duration-200">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔐</div>
          <div>
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">
              Administrator Access
            </h3>
            <p className="text-purple-700 dark:text-purple-400 text-sm">
              You have full administrative privileges. You can manage all users, incidents, relief
              centers, and system settings. Use this access responsibly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
