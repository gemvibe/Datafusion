'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface ReliefCenter {
  id: string
  name: string
  type: string
  address: string
  contact: string
  capacity: number
  status: string
  created_at: string
}

export default function AdminCentersPage() {
  const [centers, setCenters] = useState<ReliefCenter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCenters()
  }, [])

  const loadCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('relief_centers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCenters(data || [])
    } catch (error) {
      console.error('Error loading centers:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'full': return 'bg-red-100 text-red-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hospital': return '🏥'
      case 'shelter': return '🏠'
      case 'fire station': return '🚒'
      case 'police': return '👮'
      default: return '📍'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relief Centers</h1>
          <p className="text-gray-600 mt-1">Manage relief centers and emergency facilities</p>
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          + Add Center
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Centers</p>
          <p className="text-2xl font-bold text-gray-900">{centers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {centers.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Full</p>
          <p className="text-2xl font-bold text-red-600">
            {centers.filter(c => c.status === 'full').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Capacity</p>
          <p className="text-2xl font-bold text-blue-600">
            {centers.reduce((sum, c) => sum + c.capacity, 0)}
          </p>
        </div>
      </div>

      {/* Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-500">Loading centers...</p>
          </div>
        ) : centers.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-500">No centers found</p>
          </div>
        ) : (
          centers.map((center) => (
            <div key={center.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{getTypeIcon(center.type)}</span>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{center.name}</h3>
                    <p className="text-sm text-gray-500">{center.type}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(center.status)}`}>
                  {center.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <span className="text-gray-400 mr-2">📍</span>
                  <span className="text-gray-700">{center.address}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">📞</span>
                  <span className="text-gray-700">{center.contact}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">👥</span>
                  <span className="text-gray-700">Capacity: {center.capacity}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                  Edit
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100">
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
