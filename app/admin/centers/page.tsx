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
  operational_status?: string
  latitude: number
  longitude: number
  created_at: string
}

interface NewCenter {
  name: string
  address: string
  latitude: string
  longitude: string
  capacity: string
  contact_phone: string
  contact_email: string
  operational_status: string
  type: string
}

export default function AdminCentersPage() {
  const [centers, setCenters] = useState<ReliefCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<NewCenter>({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    capacity: '',
    contact_phone: '',
    contact_email: '',
    operational_status: 'active',
    type: 'shelter'
  })

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
        console.error('Supabase error:', supabaseError)
        throw new Error(supabaseError.message || 'Failed to load centers')
      }
      
      setCenters(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load centers'
      console.error('Error loading centers:', errorMessage)
      setError(errorMessage)
      setCenters([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddCenter = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      setError(null)

      // Validate required fields
      if (!formData.name || !formData.address || !formData.latitude || !formData.longitude || 
          !formData.capacity || !formData.contact_phone) {
        throw new Error('Please fill in all required fields')
      }

      // Insert into database
      const { data, error: insertError } = await supabase
        .from('rescue_shelters')
        .insert([{
          name: formData.name,
          address: formData.address,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          capacity: parseInt(formData.capacity),
          current_load: 0,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email || null,
          operational_status: formData.operational_status,
        }])
        .select()

      if (insertError) {
        console.error('Insert error:', insertError)
        throw new Error(insertError.message || 'Failed to add center')
      }

      // Success!
      alert('✅ Rescue shelter added successfully!')
      setShowAddModal(false)
      setFormData({
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        capacity: '',
        contact_phone: '',
        contact_email: '',
        operational_status: 'active',
        type: 'shelter'
      })
      loadCenters() // Reload the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add center'
      alert('❌ ' + errorMessage)
      console.error('Error adding center:', errorMessage)
    } finally {
      setSubmitting(false)
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
      default: return '📍'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tamil Nadu Rescue Shelters Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage rescue shelters and emergency facilities across Tamil Nadu</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
        >
          + Add Center
        </button>
      </div>

      {/* Add Center Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Rescue Shelter</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleAddCenter} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Center Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Center Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Chennai Central Rescue Shelter"
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      rows={2}
                      placeholder="Full address"
                    />
                  </div>

                  {/* Latitude */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 13.0827"
                    />
                  </div>

                  {/* Longitude */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 80.2707"
                    />
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 500"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.operational_status}
                      onChange={(e) => setFormData({ ...formData, operational_status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="full">Full</option>
                    </select>
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 044-28521144"
                    />
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {submitting ? 'Adding...' : 'Add Center'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
                  <li>Verify rescue_shelters table exists in Supabase</li>
                  <li>Check RLS policies allow reading rescue_shelters</li>
                  <li>Run <code className="bg-yellow-200 px-1 rounded">supabase/schema.sql</code></li>
                  <li>Or disable RLS with <code className="bg-yellow-200 px-1 rounded">supabase/disable-rls.sql</code></li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Centers</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{centers.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-500">
            {centers.filter(c => c.operational_status?.toLowerCase() === 'active').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">Full</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-500">
            {centers.filter(c => c.operational_status?.toLowerCase() === 'full').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Capacity</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
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
            <p className="text-gray-500 dark:text-gray-400">No centers found</p>
          </div>
        ) : (
          centers.map((center) => (
            <div key={center.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{getTypeIcon(center.type)}</span>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{center.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{center.type || 'Unknown Type'}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(center.operational_status)}`}>
                  {center.operational_status || 'unknown'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <span className="text-gray-400 dark:text-gray-500 mr-2">📍</span>
                  <span className="text-gray-700 dark:text-gray-300">{center.address}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 dark:text-gray-500 mr-2">📞</span>
                  <span className="text-gray-700 dark:text-gray-300">{center.contact_phone}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 dark:text-gray-500 mr-2">👥</span>
                  <span className="text-gray-700 dark:text-gray-300">Capacity: {center.capacity}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t dark:border-gray-700 flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                  ✏️ Edit
                </button>
                <a
                  href={`https://www.google.com/maps?q=${center.latitude},${center.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 text-sm bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/50 text-center transition-colors"
                >
                  🗺️ View on Map
                </a>
                <a
                  href={`tel:${center.contact_phone}`}
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-center transition-colors"
                >
                  📞 Call
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
