'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useIncidents } from '@/lib/hooks/useIncidents'
import { supabase } from '@/lib/supabase/client'
import { calculateDistance, estimateTravelTime } from '@/lib/utils'

interface RescueCenter {
  id: string
  name: string
  latitude: number
  longitude: number
  address: string
}

export default function IncidentsPage() {
  const { incidents, loading, error } = useIncidents()
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [rescueCenters, setRescueCenters] = useState<RescueCenter[]>([])
  const [loadingCenters, setLoadingCenters] = useState(true)

  // Fetch rescue centers
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const { data, error } = await supabase
          .from('rescue_shelters')
          .select('id, name, latitude, longitude, address')
          .eq('operational_status', 'active')
        
        if (error) throw error
        setRescueCenters(data || [])
      } catch (err) {
        console.error('Error fetching rescue centers:', err)
      } finally {
        setLoadingCenters(false)
      }
    }
    
    fetchCenters()
  }, [])

  // Filter incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const urgencyMatch = urgencyFilter === 'all' || incident.urgency === urgencyFilter.toLowerCase()
      const typeMatch = typeFilter === 'all' || incident.type === typeFilter.toLowerCase()
      const statusMatch = statusFilter === 'all' || incident.status === statusFilter.toLowerCase()
      return urgencyMatch && typeMatch && statusMatch
    })
  }, [incidents, urgencyFilter, typeFilter, statusFilter])

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: incidents.length,
      critical: incidents.filter(i => i.urgency === 'critical').length,
      pending: incidents.filter(i => i.status === 'pending').length,
      resolved: incidents.filter(i => i.status === 'resolved').length,
    }
  }, [incidents])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'low': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      case 'assigned': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'en_route': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'on_scene': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
      case 'resolved': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'cancelled': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flood': return '🌊'
      case 'earthquake': return '🏚️'
      case 'cyclone': return '🌀'
      case 'tsunami': return '🌊'
      case 'landslide': return '⛰️'
      case 'heatwave': return '🌡️'
      default: return '🌪️'
    }
  }

  // Find nearest rescue center for an incident
  const findNearestCenter = (incident: any) => {
    if (!incident.latitude || !incident.longitude || rescueCenters.length === 0) {
      return null
    }

    let nearestCenter = null
    let minDistance = Infinity

    for (const center of rescueCenters) {
      const distance = calculateDistance(
        incident.latitude,
        incident.longitude,
        center.latitude,
        center.longitude
      )

      if (distance < minDistance) {
        minDistance = distance
        nearestCenter = {
          ...center,
          distance,
          estimatedTime: estimateTravelTime(distance),
        }
      }
    }

    return nearestCenter
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Natural Disasters - Tamil Nadu</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all natural disaster reports across Tamil Nadu</p>
        </div>
        <Link 
          href="/incidents/new"
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          🌪️ Report Disaster
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Reports</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-400">Critical</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.critical}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
        <div className="flex flex-wrap gap-4">
          <select 
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
          >
            <option value="all">All Urgency</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
          >
            <option value="all">All Types</option>
            <option value="flood">Flood</option>
            <option value="earthquake">Earthquake</option>
            <option value="cyclone">Cyclone</option>
            <option value="tsunami">Tsunami</option>
            <option value="landslide">Landslide</option>
            <option value="heatwave">Heatwave</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 transition-colors duration-200"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="en_route">En Route</option>
            <option value="on_scene">On Scene</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center transition-colors duration-200">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading disaster reports...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 transition-colors duration-200">
          <div className="flex items-start">
            <div className="text-2xl mr-3">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300 mb-1">Error Loading Data</h3>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Please ensure database tables are set up. Check Supabase and run schema-no-rls.sql if needed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Incidents List */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredIncidents.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400 transition-colors duration-200">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Incidents Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {incidents.length === 0 
                  ? 'Start by reporting an incident or wait for incoming reports'
                  : 'No incidents match your current filters. Try adjusting the filters above.'}
              </p>
            </div>
          ) : (
            filteredIncidents.map((incident) => {
              const nearestCenter = findNearestCenter(incident)
              
              return (
              <div key={incident.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all duration-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{getTypeIcon(incident.type)}</div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{incident.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{incident.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded ${getUrgencyColor(incident.urgency)}`}>
                      {incident.urgency?.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded ${getStatusColor(incident.status)}`}>
                      {incident.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <span className="mr-2">📍</span>
                    <span>{incident.address}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <span className="mr-2">📞</span>
                    <span>{incident.reporter_phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <span className="mr-2">👤</span>
                    <span>Reported by: {incident.reported_by}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">⏰</span>
                    <span>{new Date(incident.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {/* Nearest Help Center Info */}
                {nearestCenter && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">
                          🚑 Nearest Help Center
                        </div>
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>{nearestCenter.name}</strong>
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          📍 {nearestCenter.address}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                          {nearestCenter.estimatedTime}
                          <span className="text-sm font-normal"> min</span>
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300">
                          {nearestCenter.distance} km away
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {loadingCenters && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-center text-sm text-gray-500 dark:text-gray-400">
                    Loading help centers...
                  </div>
                )}

                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                  <a
                    href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    📍 View on Map
                  </a>
                </div>
              </div>
            )})
          )}
        </div>
      )}
    </div>
  )
}
