'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface ReliefCenter {
  id: string
  name: string
  type?: string
  address: string
  contact_phone: string
  contact_email?: string
  capacity: number
  current_load?: number
  operational_status?: string
  latitude: number
  longitude: number
  created_at: string
}

export default function CentersPage() {
  const [centers, setCenters] = useState<ReliefCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadCenters()
  }, [])

  const loadCenters = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: supabaseError } = await supabase
        .from('rescue_shelters')
        .select('*')
        .order('created_at', { ascending: false })

      if (supabaseError) {
        console.error('Supabase error details:', {
          message: supabaseError.message,
          details: supabaseError.details,
          hint: supabaseError.hint,
          code: supabaseError.code,
          full: supabaseError
        })
        throw new Error(supabaseError.message || supabaseError.details || 'Failed to load centers')
      }
      
      if (!data) {
        console.warn('No data returned from rescue_shelters query')
        setCenters([])
      } else {
        console.log(`Successfully loaded ${data.length} centers`)
        setCenters(data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load centers'
      console.error('Error loading centers:', errorMessage, err)
      setError(errorMessage)
      setCenters([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'full': return 'bg-red-100 text-red-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getTypeIcon = (type?: string) => {
    if (!type) return '📍'
    switch (type.toLowerCase()) {
      case 'hospital': return '🏥'
      case 'shelter': return '🏠'
      case 'fire station': return '🚒'
      case 'fire_station': return '🚒'
      case 'police': return '👮'
      case 'food_distribution': return '🍲'
      case 'medical_camp': return '⛑️'
      default: return '📍'
    }
  }

  const getCapacityStatus = (capacity: number, currentLoad?: number) => {
    if (!currentLoad) return { percentage: 0, color: 'bg-green-500' }
    const percentage = (currentLoad / capacity) * 100
    let color = 'bg-green-500'
    if (percentage >= 90) color = 'bg-red-500'
    else if (percentage >= 70) color = 'bg-yellow-500'
    return { percentage, color }
  }

  const filteredCenters = centers.filter(center => {
    const matchesType = filterType === 'all' || center.type?.toLowerCase() === filterType.toLowerCase()
    const matchesStatus = filterStatus === 'all' || center.operational_status?.toLowerCase() === filterStatus.toLowerCase()
    return matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏥 Tamil Nadu Rescue Shelters</h1>
          <p className="text-gray-600 mt-1">Find emergency response facilities near you across Tamil Nadu</p>
        </div>
        {!loading && centers.length > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{filteredCenters.length}</div>
            <div className="text-sm text-gray-500">Centers Available</div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <div className="font-bold text-yellow-900 mb-1">Unable to Load Centers</div>
              <div className="text-sm text-yellow-800 mb-2">{error}</div>
              <div className="text-xs text-yellow-700">
                Please contact your administrator or try again later.
              </div>
              <button
                onClick={loadCenters}
                className="mt-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
              >
                🔄 Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Centers</p>
          <p className="text-2xl font-bold text-gray-900">{centers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {centers.filter(c => c.operational_status?.toLowerCase() === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Full Capacity</p>
          <p className="text-2xl font-bold text-red-600">
            {centers.filter(c => c.operational_status?.toLowerCase() === 'full').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Capacity</p>
          <p className="text-2xl font-bold text-blue-600">
            {centers.reduce((sum, c) => sum + (c.capacity || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="hospital">Medical Center</option>
            <option value="shelter">Shelter</option>
            <option value="fire_station">Fire Station</option>
            <option value="police">Police</option>
            <option value="food_distribution">Food Distribution</option>
            <option value="medical_camp">Medical Camp</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="full">Full</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          onClick={loadCenters}
          className="ml-auto px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12">
            <div className="text-4xl mb-4 animate-pulse">🔄</div>
            <p className="text-gray-500">Loading rescue shelters...</p>
          </div>
        ) : filteredCenters.length === 0 ? (
          <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {centers.length === 0 ? "No Rescue Shelters Available" : "No Shelters Match Filters"}
            </h3>
            <p className="text-gray-600 mb-4">
              {centers.length === 0 
                ? "Centers will be added by administrators as they become available."
                : "Try adjusting your filters to see more results."}
            </p>
          </div>
        ) : (
          filteredCenters.map((center) => {
            const capacityStatus = getCapacityStatus(center.capacity, center.current_load)
            
            return (
              <div key={center.id} className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getTypeIcon(center.type)}</span>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{center.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{center.type || 'Rescue Shelter'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(center.operational_status)}`}>
                    {center.operational_status || 'unknown'}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">📍</span>
                    <span className="text-gray-700 flex-1">{center.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">📞</span>
                    <a href={`tel:${center.contact_phone}`} className="text-blue-600 hover:underline">
                      {center.contact_phone}
                    </a>
                  </div>
                  {center.contact_email && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">✉️</span>
                      <a href={`mailto:${center.contact_email}`} className="text-blue-600 hover:underline text-xs">
                        {center.contact_email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Capacity Bar */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">Capacity</span>
                    <span className="text-gray-600">
                      {center.current_load || 0} / {center.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${capacityStatus.color} h-2 rounded-full transition-all`}
                      style={{ width: `${Math.min(capacityStatus.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {center.current_load 
                      ? `${Math.round(capacityStatus.percentage)}% occupied`
                      : 'Available space'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${center.latitude},${center.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-center"
                  >
                    🗺️ View on Map
                  </a>
                  <a
                    href={`tel:${center.contact_phone}`}
                    className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 text-center"
                  >
                    📞 Call
                  </a>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Info Section */}
      {!loading && centers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <span>ℹ️</span>
            <span>Rescue Shelter Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <div className="font-semibold mb-1">📞 Emergency Contact</div>
              <div>Call the center directly for immediate assistance</div>
            </div>
            <div>
              <div className="font-semibold mb-1">🗺️ Location</div>
              <div>Click "View on Map" to get directions</div>
            </div>
            <div>
              <div className="font-semibold mb-1">⚠️ Capacity Status</div>
              <div>Check availability before visiting</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

