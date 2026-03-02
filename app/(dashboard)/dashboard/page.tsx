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

export default function CommandCenterDashboard() {
  const { incidents, loading } = useIncidents()
  const [centers, setCenters] = useState<ReliefCenter[]>([])
  const [chatOpen, setChatOpen] = useState(false)

  // Calculate statistics
  const activeIncidents = incidents.filter(i => 
    i.status !== 'resolved' && i.status !== 'cancelled'
  )
  const criticalCount = activeIncidents.filter(i => i.urgency === 'critical').length
  const highCount = activeIncidents.filter(i => i.urgency === 'high').length
  const respondersOnMission = incidents.filter(i => 
    i.status === 'assigned' || i.status === 'en_route' || i.status === 'on_scene'
  ).length
  
  // Average response time
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
    ? avgResponseMinutes < 60 ? `${avgResponseMinutes}m` : `${Math.round(avgResponseMinutes / 60)}h`
    : '-'

  const operationalCenters = centers.filter(c => c.operational_status === 'active').length

  // Risk calculation
  const riskLevel = criticalCount > 5 ? 85 : criticalCount > 2 ? 60 : 35

  useEffect(() => {
    loadCenters()
  }, [])

  const loadCenters = async () => {
    try {
      const { data } = await supabase.from('rescue_shelters').select('*')
      setCenters(data || [])
    } catch (err) {
      console.error('Error loading centers:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Incidents"
          value={loading ? '...' : activeIncidents.length}
          icon="🌪️"
          color="red"
          subtitle={`${criticalCount} critical cases`}
        />
        <StatCard
          title="Critical Cases"
          value={loading ? '...' : criticalCount}
          icon="🚨"
          color="orange"
          subtitle={`${highCount} high priority`}
        />
        <StatCard
          title="Teams Deployed"
          value={loading ? '...' : respondersOnMission}
          icon="👥"
          color="blue"
          subtitle={`${respondersOnMission} on mission`}
        />
        <StatCard
          title="Avg Response Time"
          value={avgResponseDisplay}
          icon="⚡"
          color="green"
          subtitle={`${operationalCenters} centers active`}
        />
      </div>

      {/* Main Command Center Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Live Map */}
        <div className="lg:col-span-1">
          <div className="command-card p-0 overflow-hidden" style={{height: '600px'}}>
            <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center transition-colors duration-200">
              {/* Map Placeholder */}
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Interactive Map View</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Real-time incident tracking across Tamil Nadu</p>
                <Link 
                  href="/map"
                  className="inline-block px-6 py-3 bg-[#0B3D91] text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                >
                  Open Full Map →
                </Link>
              </div>

              {/* Map Floating Controls */}
              <div className="absolute top-4 right-4 space-y-2">
                <button className="glass-card px-3 py-2 text-sm font-medium hover:bg-white/90 dark:hover:bg-gray-700/90 transition-colors dark:text-gray-100">
                  📍 Locate Me
                </button>
                <div className="glass-card px-2 py-1 flex flex-col gap-1">
                  <button className="px-3 py-1 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded dark:text-gray-100">+</button>
                  <div className="h-px bg-gray-300 dark:bg-gray-600"></div>
                  <button className="px-3 py-1 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded dark:text-gray-100">−</button>
                </div>
                <button className="glass-card px-3 py-2 text-sm">🧭</button>
              </div>

              {/* Sample Map Markers */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg animate-pulse">!</div>
                  <div className="absolute inset-0 w-8 h-8 bg-red-500 rounded-full opacity-20 pulse-ring"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Ticker */}
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg overflow-hidden transition-colors duration-200">
            <div className="ticker-scroll whitespace-nowrap py-3 px-4 text-sm font-medium text-red-800 dark:text-red-300">
              🔴 Critical flood report — Velachery — 2 min ago &nbsp;&nbsp;•&nbsp;&nbsp; 
              🟠 Moderate rainfall — Anna Nagar — 15 min ago &nbsp;&nbsp;•&nbsp;&nbsp;
              🔴 Emergency medical — T.Nagar — 30 min ago
            </div>
          </div>
        </div>

        {/* RIGHT: AI Insights Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="command-card p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-4 flex items-center gap-2">
              <span>🧠</span> AI Insights
            </h3>

            {/* Insight Cards */}
            <div className="space-y-3 mb-6">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg transition-colors duration-200">
                <div className="font-semibold text-orange-900 dark:text-orange-300 text-sm mb-1">⚠️ Flood Risk Rising</div>
                <p className="text-xs text-orange-700 dark:text-orange-400">South Chennai experiencing heavy rainfall. 3 areas at risk.</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg transition-colors duration-200">
                <div className="font-semibold text-red-900 dark:text-red-300 text-sm mb-1">🚨 Cluster Detected</div>
                <p className="text-xs text-red-700 dark:text-red-400">5 critical cases within 1 km radius in Velachery.</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors duration-200">
                <div className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-1">🌧️ Weather Alert</div>
                <p className="text-xs text-blue-700 dark:text-blue-400">Heavy rainfall detected. Response teams on standby.</p>
              </div>
            </div>

            {/* Risk Meter */}
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl transition-colors duration-200">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">City Risk Level</div>
              <div className="relative w-full h-32 flex items-end justify-center">
                <svg className="w-full h-full" viewBox="0 0 200 100">
                  <defs>
                    <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#43A047" />
                      <stop offset="50%" stopColor="#FB8C00" />
                      <stop offset="100%" stopColor="#E53935" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 20 90 A 80 80 0 0 1 180 90"
                    fill="none"
                    stroke="url(#riskGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <circle
                    cx={20 + (160 * riskLevel / 100)}
                    cy={90}
                    r="8"
                    fill={riskLevel > 70 ? '#E53935' : riskLevel > 40 ? '#FB8C00' : '#43A047'}
                    className="drop-shadow-lg"
                  />
                </svg>
              </div>
              <div className="text-center mt-2">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{riskLevel}%</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {riskLevel > 70 ? 'High Risk' : riskLevel > 40 ? 'Moderate' : 'Low Risk'}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="command-card p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {activeIncidents.slice(0, 3).map((incident) => (
                <Link
                  key={incident.id}
                  href={`/incidents`}
                  className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="text-xs font-medium text-gray-900 dark:text-gray-100">{incident.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{incident.address}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Chatbot */}
      {chatOpen ? (
        <div className="fixed bottom-6 right-6 w-96 h-[520px] command-card shadow-2xl overflow-hidden z-50">
          <div className="bg-[#0B3D91] dark:bg-gray-800 text-white p-4 flex items-center justify-between transition-colors duration-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="font-bold">AI Assistant</span>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-white hover:text-gray-200">
              ✕
            </button>
          </div>
          <div className="p-4 space-y-2">
            <button className="w-full py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200">
              🌊 Flood Help
            </button>
            <button className="w-full py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-300 rounded-lg text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors duration-200">
              🔥 Fire Help
            </button>
            <button className="w-full py-2 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200">
              🏥 Medical Help
            </button>
            <button className="w-full py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200">
              📝 Report Incident
            </button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-3">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm dark:text-gray-100 transition-colors duration-200">
                Hello! I'm your AI assistant. How can I help you today?
              </div>
            </div>
          </div>
          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
              />
              <button className="px-4 py-2 bg-[#0B3D91] dark:bg-blue-600 text-white rounded-lg hover:bg-blue-800 dark:hover:bg-blue-700 transition-colors duration-200">
                →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-[#0B3D91] dark:bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-800 dark:hover:bg-blue-700 transition-all hover:scale-110 z-50 flex items-center justify-center text-3xl"
        >
          🤖
        </button>
      )}
    </div>
  )
}

function StatCard({ title, value, icon, color, subtitle }: {
  title: string
  value: string | number
  icon: string
  color: 'red' | 'orange' | 'blue' | 'green'
  subtitle: string
}) {
  const colors = {
    red: 'bg-red-100 dark:bg-red-900/30',
    orange: 'bg-orange-100 dark:bg-orange-900/30',
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
  }

  return (
    <div className="command-card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
        </div>
        <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center text-2xl transition-colors duration-200`}>
          {icon}
        </div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>
    </div>
  )
}
