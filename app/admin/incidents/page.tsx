'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

// Using any type since database schema doesn't match the Incident type definition
interface DatabaseIncident {
  id: string
  title: string
  description: string
  type: string
  urgency: string
  urgency_score: number
  status: string
  address: string
  landmark?: string
  latitude: number
  longitude: number
  reported_by: string
  reporter_phone: string
  report_source: string
  ai_summary?: string
  created_at: string
  updated_at: string
  is_spam?: boolean
  spam_score?: number
  spam_reason?: string
  spam_checked_at?: string
  manual_review_status?: string
  reviewed_by?: string
  reviewed_at?: string
  weather_validated?: boolean
  weather_matches?: boolean
  weather_data?: any
}

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<DatabaseIncident[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [spamFilter, setSpamFilter] = useState<'all' | 'legitimate' | 'spam' | 'unchecked'>('all')
  const [checkingSpam, setCheckingSpam] = useState<string | null>(null)
  const [bulkChecking, setBulkChecking] = useState(false)

  useEffect(() => {
    loadIncidents()

    // Set up real-time subscription
    const channel = supabase
      .channel('admin-incidents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incidents',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setIncidents((current) => [payload.new as DatabaseIncident, ...current])
            // Show notification for new incident
            if (Notification.permission === 'granted') {
              new Notification('🚨 New Emergency Report', {
                body: `${(payload.new as any).address} - ${(payload.new as any).type}`,
              })
            }
          } else if (payload.eventType === 'UPDATE') {
            setIncidents((current) =>
              current.map((i) =>
                i.id === (payload.new as DatabaseIncident).id ? (payload.new as DatabaseIncident) : i
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setIncidents((current) =>
              current.filter((i) => i.id !== (payload.old as DatabaseIncident).id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadIncidents = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📊 Loading incidents from API...')
      
      // Use the API route instead of direct Supabase call
      const response = await fetch('/api/incidents?limit=100')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || 'Failed to load incidents')
      }
      
      const result = await response.json()
      console.log(`✅ Loaded ${result.incidents?.length || 0} incidents from API`)
      setIncidents(result.incidents || [])
    } catch (err: any) {
      const errorMsg = err?.message || err?.toString() || 'Unknown error'
      console.error('❌ Error loading incidents:', errorMsg)
      setError(errorMsg)
      setIncidents([])
      
      // Show user-friendly error message
      if (errorMsg.includes('SSL') || errorMsg.includes('fetch') || errorMsg.includes('Network')) {
        console.error('⚠️ Network error: Please check your internet connection or try again later')
      } else if (errorMsg.includes('policy') || errorMsg.includes('permission')) {
        console.error('⚠️ Permission error: RLS may be blocking access')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      console.log('🔄 Updating incident status via API:', id, '→', newStatus)
      
      const response = await fetch('/api/incidents', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          updates: { status: newStatus }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || 'Failed to update status')
      }

      const result = await response.json()
      console.log('✅ Status updated successfully:', result.incident)
      
      // Update local state
      setIncidents((current) =>
        current.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
      )
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || 'Unknown error occurred'
      
      console.error('❌ Error updating status:', errorMsg)
      
      // Show appropriate user message
      if (errorMsg.includes('Network') || errorMsg.includes('fetch')) {
        alert('⚠️ Network error: Unable to connect. Please check your internet connection and try again.')
      } else {
        alert(`⚠️ Failed to update status: ${errorMsg}`)
      }
    }
  }

  // Spam check functions
  const checkSpam = async (incidentId: string) => {
    setCheckingSpam(incidentId)
    try {
      const response = await fetch('/api/incidents/check-spam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Refresh incidents list
        await loadIncidents()
        alert(`✅ Spam Check Complete\n\n${result.analysis.isSpam ? '⚠️ SPAM DETECTED' : '✓ Legitimate Report'}\n\nConfidence: ${result.analysis.confidence}%\nReason: ${result.analysis.reason}`)
      } else {
        throw new Error(result.error || 'Failed to check spam')
      }
    } catch (error: any) {
      console.error('Spam check failed:', error)
      alert(`❌ Failed to check spam: ${error.message}`)
    } finally {
      setCheckingSpam(null)
    }
  }

  const checkAllSpam = async () => {
    if (!confirm('Check all unchecked reports for spam? This may take a while and consume API credits.')) return
    
    setBulkChecking(true)
    try {
      const response = await fetch('/api/incidents/check-all-spam', {
        method: 'POST',
      })
      const result = await response.json()
      
      if (result.success) {
        await loadIncidents()
        alert(`✅ Bulk Check Complete\n\nTotal: ${result.checked}\nSuccess: ${result.successCount}\nFailed: ${result.failCount}`)
      } else {
        throw new Error(result.error || 'Bulk spam check failed')
      }
    } catch (error: any) {
      alert(`❌ Bulk spam check failed: ${error.message}`)
    } finally {
      setBulkChecking(false)
    }
  }

  const manualMarkSpam = async (incidentId: string, isSpam: boolean) => {
    if (!confirm(`Mark this report as ${isSpam ? 'SPAM' : 'LEGITIMATE'}?`)) return
    
    try {
      const { error } = await supabase
        .from('incidents')
        .update({
          is_spam: isSpam,
          spam_score: isSpam ? 100 : 0,
          spam_reason: isSpam ? 'Manually marked as spam by admin' : 'Manually verified as legitimate by admin',
          spam_checked_at: new Date().toISOString(),
          manual_review_status: isSpam ? 'verified_spam' : 'verified_legitimate',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', incidentId)

      if (error) throw error

      await loadIncidents()
      alert(`✅ Successfully marked as ${isSpam ? 'spam' : 'legitimate'}`)
    } catch (error: any) {
      alert(`❌ Failed to update: ${error.message}`)
    }
  }

  const filteredIncidents = incidents.filter((i) => {
    // Status filter
    if (filter !== 'all' && i.status !== filter) return false
    
    // Spam filter
    if (spamFilter === 'spam' && !i.is_spam) return false
    if (spamFilter === 'legitimate' && (i.is_spam || i.spam_checked_at === null)) return false
    if (spamFilter === 'unchecked' && i.spam_checked_at !== null) return false
    
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800'
      case 'assigned':
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800'
      case 'en_route':
      case 'arrived':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (score: number) => {
    if (score >= 8) return 'text-red-600'
    if (score >= 6) return 'text-orange-600'
    if (score >= 4) return 'text-yellow-600'
    return 'text-green-600'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Natural Disaster Reports</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage all natural disaster reports across Tamil Nadu
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {loading ? (
              'Loading...'
            ) : (
              <>
                <span className="font-bold text-2xl text-gray-900">{filteredIncidents.length}</span>{' '}
                {filter === 'all' ? 'total' : filter} reports
              </>
            )}
          </div>
        </div>
      </div>

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
                  <li>Verify incidents table exists in Supabase</li>
                  <li>Check RLS policies allow reading incidents</li>
                  <li>Run <code className="bg-yellow-200 px-1 rounded">supabase/schema.sql</code> to create tables</li>
                  <li>Or run <code className="bg-yellow-200 px-1 rounded">supabase/disable-rls.sql</code> to disable RLS for testing</li>
                </ol>
              </div>
              <button
                onClick={loadIncidents}
                className="mt-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
              >
                🔄 Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        {/* Status Filter */}
        <div className="flex gap-4 items-center">
          <label className="text-sm font-semibold text-gray-700">Status:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="en_route">En Route</option>
            <option value="resolved">Resolved</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={loadIncidents}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Spam Filter */}
        <div className="flex gap-2 items-center border-t pt-4">
          <label className="text-sm font-semibold text-gray-700 mr-2">Spam Check:</label>
          <button
            onClick={() => setSpamFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              spamFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📋 All Reports
          </button>
          <button
            onClick={() => setSpamFilter('legitimate')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              spamFilter === 'legitimate'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✓ Legitimate Only
          </button>
          <button
            onClick={() => setSpamFilter('spam')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              spamFilter === 'spam'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⚠️ Spam Only
          </button>
          <button
            onClick={() => setSpamFilter('unchecked')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              spamFilter === 'unchecked'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔍 Unchecked
          </button>
          <button
            onClick={checkAllSpam}
            disabled={bulkChecking}
            className="ml-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {bulkChecking ? '⏳ Checking...' : '🔍 Check All Unchecked'}
          </button>
        </div>
      </div>

      {/* Incidents List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading emergency reports...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Found</h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? 'No disaster reports yet. They will appear here when submitted.'
              : `No ${filter} incidents at the moment.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-bold text-gray-900">
                      {incident.type?.toUpperCase() || 'EMERGENCY'}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        incident.status
                      )}`}
                    >
                      {incident.status.toUpperCase()}
                    </span>
                    <span className={`font-bold ${getUrgencyColor(incident.urgency_score || 5)}`}>
                      Urgency: {incident.urgency_score || 5}/10
                    </span>
                    
                    {/* Spam Status Badge */}
                    {incident.spam_checked_at && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          incident.is_spam
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-green-100 text-green-800 border border-green-300'
                        }`}
                      >
                        {incident.is_spam
                          ? `⚠️ SPAM (${incident.spam_score}%)`
                          : `✓ Legitimate (${100 - (incident.spam_score || 0)}%)`}
                      </span>
                    )}
                    {!incident.spam_checked_at && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">
                        🔍 Not Checked
                      </span>
                    )}
                  </div>
                  
                  {/* Spam Reason */}
                  {incident.spam_reason && (
                    <div className={`text-xs mb-2 p-2 rounded ${
                      incident.is_spam ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}>
                      <span className="font-semibold">AI Analysis:</span> {incident.spam_reason}
                    </div>
                  )}

                  {/* Weather Validation */}
                  {incident.weather_validated && (
                    <div className={`text-xs mb-2 p-2 rounded border ${
                      incident.weather_matches 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-orange-50 text-orange-700 border-orange-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {incident.weather_matches ? '☀️ Weather Match:' : '⚠️ Weather Mismatch:'}
                        </span>
                        {incident.weather_data && (
                          <span>
                            {incident.weather_data.temperature}°C, {incident.weather_data.condition}
                            {incident.weather_data.rain > 0 && `, ${incident.weather_data.rain}mm rain`}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-gray-700 mb-3">{incident.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">📍 Location:</span>{' '}
                      <span className="font-medium">{incident.address}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">👤 Reporter:</span>{' '}
                      <span className="font-medium">{incident.reported_by}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">📞 Contact:</span>{' '}
                      <span className="font-medium">{incident.reporter_phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">🕐 Reported:</span>{' '}
                      <span className="font-medium">{formatTimeAgo(incident.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t pt-4 flex-wrap">
                {/* Spam Check Actions */}
                <div className="flex gap-2 w-full mb-2 pb-2 border-b border-gray-200">
                  <button
                    onClick={() => checkSpam(incident.id)}
                    disabled={checkingSpam === incident.id}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingSpam === incident.id ? '🔄 Checking...' : '🔍 Check Spam'}
                  </button>
                  {incident.spam_checked_at && (
                    <>
                      <button
                        onClick={() => manualMarkSpam(incident.id, true)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        ⚠️ Mark as Spam
                      </button>
                      <button
                        onClick={() => manualMarkSpam(incident.id, false)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        ✓ Mark as Legitimate
                      </button>
                    </>
                  )}
                </div>

                {/* Status Actions */}
                {incident.status === 'pending' && (
                  <button
                    onClick={() => updateStatus(incident.id, 'assigned')}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    ✅ Assign to Team
                  </button>
                )}
                {incident.status === 'assigned' && (
                  <>
                    <button
                      onClick={() => updateStatus(incident.id, 'en_route')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      🚗 Mark En Route
                    </button>
                    <button
                      onClick={() => updateStatus(incident.id, 'resolved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      ✔️ Mark Resolved
                    </button>
                  </>
                )}
                {incident.status === 'en_route' && (
                  <button
                    onClick={() => updateStatus(incident.id, 'resolved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    ✔️ Mark Resolved
                  </button>
                )}
                {(incident.status === 'resolved' || incident.status === 'on_scene') && (
                  <button
                    onClick={() => updateStatus(incident.id, 'pending')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    🔄 Reopen
                  </button>
                )}
                <a
                  href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm inline-block text-center"
                >
                  📍 View on Map
                </a>
                <a
                  href={`tel:${incident.reporter_phone}`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm inline-block text-center"
                >
                  📞 Call Reporter
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
