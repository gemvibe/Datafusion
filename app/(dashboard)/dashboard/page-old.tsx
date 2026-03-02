'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useIncidents } from '@/lib/hooks/useIncidents'
import { supabase } from '@/lib/supabase/client'

interface ReliefCenter {
  id: string
  name: string
  type?: string
  operational_status?: string
  capacity: number
  current_load?: number
}

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState('')
  const { incidents, loading } = useIncidents()
  const [centers, setCenters] = useState<ReliefCenter[]>([])
  const [centersLoading, setCentersLoading] = useState(true)

  // Calculate statistics from incidents
  const activeIncidents = incidents.filter(i => 
    i.status !== 'resolved' && i.status !== 'cancelled'
  )
  const criticalCount = activeIncidents.filter(i => i.urgency === 'critical').length
  const highCount = activeIncidents.filter(i => i.urgency === 'high').length

  // Calculate responder statistics based on incident status
  const respondersOnMission = incidents.filter(i => 
    i.status === 'assigned' || i.status === 'en_route' || i.status === 'on_scene'
  ).length
  const availableResponders = incidents.filter(i => i.status === 'pending').length

  // Calculate average response time for resolved incidents
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved' && i.updated_at)
  const avgResponseTime = resolvedIncidents.length > 0 
    ? resolvedIncidents.reduce((sum, incident) => {
        const created = new Date(incident.created_at).getTime()
        const resolved = new Date(incident.updated_at!).getTime()
        return sum + (resolved - created)
      }, 0) / resolvedIncidents.length
    : 0
  
  const avgResponseMinutes = Math.round(avgResponseTime / 1000 / 60)
  const avgResponseDisplay = avgResponseMinutes > 0 
    ? avgResponseMinutes < 60 
      ? `${avgResponseMinutes}m`
      : `${Math.round(avgResponseMinutes / 60)}h`
    : '-'

  // Calculate statistics from centers
  const operationalCenters = centers.filter(c => 
    c.operational_status === 'active'
  ).length

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString())
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString())
    }, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadCenters()
  }, [])

  const loadCenters = async () => {
    try {
      setCentersLoading(true)
      const { data, error } = await supabase
        .from('rescue_shelters')
        .select('*')

      if (error) {
        console.error('Error loading centers:', error)
        setCenters([])
      } else {
        setCenters(data || [])
      }
    } catch (err) {
      console.error('Error loading centers:', err)
      setCenters([])
    } finally {
      setCentersLoading(false)
    }
  }

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
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : activeIncidents.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🌪️</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-red-600 font-medium">{criticalCount} critical</span> • {highCount} high
          </div>
        </div>

        {/* Responders Active */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Responders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : respondersOnMission}
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-green-600 font-medium">{availableResponders} available</span> • {respondersOnMission} on mission
          </div>
        </div>

        {/* Rescue Shelters */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rescue Shelters</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {centersLoading ? '...' : centers.length}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏥</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span className="text-green-600 font-medium">{operationalCenters} operational</span>
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : avgResponseDisplay}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            {resolvedIncidents.length > 0 
              ? `Based on ${resolvedIncidents.length} resolved`
              : 'No data yet'
            }
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/*div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Incidents</h2>
            <Link href="/incidents" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No incidents reported yet
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.slice(0, 5).map((incident) => (
                <Link
                  key={incident.id}
                  href={`/incidents?id=${incident.id}`}
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          incident.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                          incident.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                          incident.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {incident.urgency}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {incident.type}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mt-1">
                        {incident.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {incident.address}
                      </p>
                    </div>
                    <span className={`ml-2 px-2 py-1 text-xs rounded ${
                      incident.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      incident.status === 'on_scene' ? 'bg-blue-100 text-blue-700' :
                      incident.status === 'en_route' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {incident.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}lassName="text-center py-12 text-gray-500">
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
