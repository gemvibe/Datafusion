'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'

export default function ReportIncidentPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationMessage, setLocationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    contactName: '',
    contactPhone: '',
    incidentType: 'flood',
  })

  // Auto-fill from user profile
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        contactName: profile.name || prev.contactName,
        contactPhone: profile.phone || prev.contactPhone,
        location: (profile as any).address || prev.location,
        latitude: (profile as any).latitude ? String((profile as any).latitude) : prev.latitude,
        longitude: (profile as any).longitude ? String((profile as any).longitude) : prev.longitude,
      }))
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to submit incident')
      }

      // Success - redirect to incidents page
      alert('✅ Natural disaster report submitted successfully! Our response team will be notified immediately.')
      router.push('/incidents')
    } catch (error) {
      console.error('Error submitting incident:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit report'
      alert(`❌ ${errorMessage}\n\nPossible issue: Database tables may not be set up yet. Please contact admin.`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage({ type: 'error', text: 'Geolocation is not supported by your browser' })
      return
    }

    setGettingLocation(true)
    setLocationMessage(null)
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        
        setFormData(prev => ({
          ...prev,
          latitude: String(lat),
          longitude: String(lon),
        }))

        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          )
          const data = await response.json()
          
          if (data.display_name) {
            setFormData(prev => ({
              ...prev,
              location: data.display_name,
            }))
          }
          
          setLocationMessage({ type: 'success', text: '✓ Location detected successfully!' })
        } catch (error) {
          console.error('Error getting address:', error)
          setLocationMessage({ type: 'success', text: '✓ Coordinates captured! Address may need to be entered manually.' })
        }
        
        setGettingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setLocationMessage({ 
          type: 'error', 
          text: 'Failed to get location. Please enable location permission or enter manually.' 
        })
        setGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="text-center">
        <div className="text-6xl mb-4">🚨</div>
        <h1 className="text-3xl font-bold text-gray-900">Report Natural Disaster</h1>
        <p className="text-gray-600 mt-2">
          Fill out this form to report a natural disaster in Tamil Nadu. Our response team will be notified immediately.
        </p>
      </div>

      {/* Profile Completion Notice */}
      {profile && !(profile as any).profile_completed && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">💡</span>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">Save Time on Future Reports</h3>
              <p className="text-sm text-blue-700 mb-2">
                Complete your profile to pre-fill your contact details automatically. You'll only need to describe the disaster next time!
              </p>
              <a
                href="/profile"
                className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
              >
                Complete Profile Now →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Pre-filled Notice */}
      {profile && (profile as any).profile_completed && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            ✓ Your contact details have been auto-filled from your profile. You can edit them if needed.
          </p>
        </div>
      )}

      {/* Emergency Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6 transition-colors duration-200">
        {/* Incident Type */}
        <div>
          <label htmlFor="incidentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Natural Disaster Type *
          </label>
          <select
            id="incidentType"
            name="incidentType"
            value={formData.incidentType}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
          >
            <option value="flood">🌊 Flood</option>
            <option value="earthquake">🏚️ Earthquake</option>
            <option value="cyclone">🌀 Cyclone/Storm</option>
            <option value="tsunami">🌊 Tsunami</option>
            <option value="landslide">⛰️ Landslide</option>
            <option value="heatwave">🌡️ Heatwave/Drought</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What's happening? *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe the disaster situation in detail... (e.g., 'Heavy flooding, water level rising rapidly' or 'Earthquake felt, building damage reported')"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Be as specific as possible</p>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="Full address or nearest landmark (e.g., 'Anna Nagar Bus Stand, Chennai' or 'Near GH, Coimbatore')"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Include city/district name</p>
        </div>

        {/* Coordinates Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start">
              <span className="text-xl mr-2">📍</span>
              <div>
                <h3 className="font-semibold text-blue-900 text-sm">GPS Coordinates (Optional but Recommended)</h3>
                <p className="text-xs text-blue-700 mt-1">
                  Providing exact coordinates helps emergency teams locate you faster.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors whitespace-nowrap ml-2"
            >
              {gettingLocation ? (
                <>🔄 Detecting...</>
              ) : (
                <>📍 Use Current Location</>
              )}
            </button>
          </div>
          
          {locationMessage && (
            <div
              className={`mb-3 p-2 rounded text-sm transition-colors duration-200 ${
                locationMessage.type === 'success'
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {locationMessage.text}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Latitude */}
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g., 13.0827"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors duration-200"
              />
            </div>

            {/* Longitude */}
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g., 80.2707"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors duration-200"
              />
            </div>
          </div>
          
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            💡 Tip: Long press on Google Maps to get coordinates, or use your phone's compass app
          </p>
        </div>

        {/* Contact Name */}
        <div>
          <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            required
            placeholder="Your full name"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-200"
          />
        </div>

        {/* Contact Phone */}
        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
            Contact Number *
          </label>
          <input
            type="tel"
            id="contactPhone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            required
            placeholder="10-digit mobile number"
            pattern="[0-9]{10}"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Emergency responders may call this number</p>
        </div>

        {/* Emergency Notice */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 transition-colors duration-200">
          <div className="flex items-start">
            <div className="text-2xl mr-3">⚡</div>
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-300 mb-1">Disaster Alert</h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                This report will be sent immediately to Tamil Nadu disaster response teams. 
                For life-threatening situations, also call <strong>112</strong> (Emergency Services) or <strong>1077</strong> (State Disaster Helpline).
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-semibold"
          >
            {loading ? '🔄 Submitting...' : '🌪️ Submit Disaster Report'}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500">
        <p>All reports are treated with utmost priority. False reports may lead to legal action.</p>
      </div>
    </div>
  )
}
