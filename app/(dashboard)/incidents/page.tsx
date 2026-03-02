'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useIncidents } from '@/lib/hooks/useIncidents'

export default function IncidentsPage() {
  const { incidents, loading, error } = useIncidents()
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

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
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800'
      case 'assigned': return 'bg-yellow-100 text-yellow-800'
      case 'en_route': return 'bg-blue-100 text-blue-800'
      case 'on_scene': return 'bg-purple-100 text-purple-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Reports</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Critical</div>
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Resolved</div>
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <select 
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-4 py-2 border rounded-md"
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
            className="px-4 py-2 border rounded-md"
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
            className="px-4 py-2 border rounded-md"
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
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading disaster reports...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="text-2xl mr-3">⚠️</div>
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Data</h3>
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-xs text-red-600 mt-2">
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
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Incidents Found</h3>
              <p className="text-gray-600">
                {incidents.length === 0 
                  ? 'Start by reporting an incident or wait for incoming reports'
                  : 'No incidents match your current filters. Try adjusting the filters above.'}
              </p>
            </div>
          ) : (
            filteredIncidents.map((incident) => (
              <div key={incident.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{getTypeIcon(incident.type)}</div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{incident.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
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
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">📍</span>
                    <span>{incident.address}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">📞</span>
                    <span>{incident.reporter_phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">👤</span>
                    <span>Reported by: {incident.reported_by}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">⏰</span>
                    <span>{new Date(incident.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <a
                    href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    📍 View on Map
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
