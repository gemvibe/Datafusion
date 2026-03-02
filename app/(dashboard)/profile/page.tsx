'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ProfileData {
  name: string
  phone: string
  address: string
  landmark: string
  latitude: number | null
  longitude: number | null
}

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    latitude: null,
    longitude: null,
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        address: (profile as any).address || '',
        landmark: (profile as any).landmark || '',
        latitude: (profile as any).latitude || null,
        longitude: (profile as any).longitude || null,
      })
    }
  }, [profile])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' })
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lon,
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
              address: data.display_name,
            }))
          }
          
          setMessage({ type: 'success', text: 'Location detected successfully!' })
        } catch (error) {
          console.error('Error getting address:', error)
          setMessage({ type: 'success', text: 'Location coordinates saved!' })
        }
        
        setGettingLocation(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setMessage({ type: 'error', text: 'Failed to get your location. Please enter manually.' })
        setGettingLocation(false)
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          landmark: formData.landmark,
          latitude: formData.latitude,
          longitude: formData.longitude,
          profile_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      await refreshProfile()
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">
          Complete your profile to quickly report incidents without entering your details every time.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              placeholder="Enter your full name"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              placeholder="+91-XXXXXXXXXX"
            />
          </div>

          {/* Location Detection */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Location Information</h3>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {gettingLocation ? (
                  <>🔄 Detecting...</>
                ) : (
                  <>📍 Use Current Location</>
                )}
              </button>
            </div>

            {formData.latitude && formData.longitude && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3 mb-4 transition-colors duration-200">
                <p className="text-sm text-green-800 dark:text-green-300">
                  ✓ Location: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address *
            </label>
            <textarea
              id="address"
              required
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              placeholder="Enter your full address"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This will be used as default location when reporting incidents
            </p>
          </div>

          {/* Landmark */}
          <div>
            <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nearby Landmark
            </label>
            <input
              type="text"
              id="landmark"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
              placeholder="e.g., Near City Hospital, Behind Main Market"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Why complete your profile?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Report disasters faster - just describe what's happening</li>
          <li>• Your contact info is automatically included</li>
          <li>• Responders can reach you quickly</li>
          <li>• Your location helps direct help accurately</li>
        </ul>
      </div>
    </div>
  )
}
