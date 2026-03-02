'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString())
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tamil Nadu Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time disaster response across Tamil Nadu</p>
        </div>
        <div className="flex items-center gap-4">
          {currentTime && (
            <div className="text-sm text-gray-500">
              Last updated: {currentTime}
            </div>
          )}
          <Link
            href="/incidents/new"
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
          >
            🌪️ Report Disaster
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Disasters */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Disasters</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🌪️</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-red-600 font-medium">0 critical</span> • 0 high
          </div>
        </div>

        {/* Responders Active */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Responders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-green-600 font-medium">0 available</span> • 0 on mission
          </div>
        </div>

        {/* Rescue Shelters */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rescue Shelters</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏥</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-green-600 font-medium">0 operational</span>
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            No data yet
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h2>
          <div className="text-center py-12 text-gray-500">
            No incidents reported yet
          </div>
        </div>

        {/* System Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Activity</h2>
          <div className="text-center py-12 text-gray-500">
            No activity to display
          </div>
        </div>
      </div>
    </div>
  );
}
