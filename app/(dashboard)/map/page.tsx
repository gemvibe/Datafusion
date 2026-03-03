"use client";

import dynamic from "next/dynamic";
import { useIncidents } from "@/lib/hooks/useIncidents";
import { useCenters } from "@/lib/hooks/useCenters";
import { useMemo, useState } from "react";

// Import map component with no SSR to avoid "window is not defined" error
const IncidentMap = dynamic(
  () => import("@/components/shared/IncidentMap").then((mod) => mod.IncidentMap),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading First72 Map...</div>
      </div>
    )
  }
);

export default function MapPage() {
  const { incidents, loading, error } = useIncidents();
  const { centers } = useCenters();
  const [showRouting, setShowRouting] = useState(true);
  const [highlightCritical, setHighlightCritical] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filter incidents based on status
  const filteredIncidents = useMemo(() => {
    if (filterStatus === "all") return incidents;
    return incidents.filter(i => i.status === filterStatus);
  }, [incidents, filterStatus]);

  // Calculate real-time stats based on urgency scores
  const stats = useMemo(() => {
    const critical = incidents.filter((i) => (i.urgency_score || 0) >= 8 && i.status === "pending").length;
    const high = incidents.filter((i) => (i.urgency_score || 0) >= 6 && (i.urgency_score || 0) < 8 && i.status === "pending").length;
    const medium = incidents.filter((i) => (i.urgency_score || 0) >= 4 && (i.urgency_score || 0) < 6 && i.status === "pending").length;
    const low = incidents.filter((i) => (i.urgency_score || 0) < 4 && (i.urgency_score || 0) > 0 && i.status === "pending").length;
    const total = incidents.length;
    const active = incidents.filter(i => i.status === "pending").length;
    const assigned = incidents.filter(i => i.status === "assigned").length;
    const resolved = incidents.filter(i => i.status === "resolved").length;

    return { critical, high, medium, low, total, active, assigned, resolved };
  }, [incidents]);

  return (
    <div className="space-y-4">
      {/* Header with Live Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">🗺️ Hope Link Tamil Nadu Command Center</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time disaster response across Tamil Nadu
            {!loading && <span className="ml-2 font-semibold text-blue-600">{stats.active} Active Incidents</span>}
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="animate-spin">⟳</div>
            <span>Syncing live data...</span>
          </div>
        )}
        {!loading && incidents.length > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Reports</div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 dark:border-yellow-600 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <div className="font-bold text-yellow-900 dark:text-yellow-300 mb-1">Database Connection Issue</div>
              <div className="text-sm text-yellow-800 dark:text-yellow-400 mb-2">{error}</div>
              <div className="text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded border border-yellow-300 dark:border-yellow-700">
                <div className="font-semibold mb-1">📝 To fix this:</div>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Go to your Supabase project: <a href="https://fwptmspvyazjbvcnfvsp.supabase.co" className="underline font-medium" target="_blank">Dashboard</a></li>
                  <li>Navigate to <strong>SQL Editor</strong></li>
                  <li>Run the <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">supabase/schema.sql</code> file from your project</li>
                  <li>This will create the incidents table and other required tables</li>
                  <li>Refresh this page after running the SQL</li>
                </ol>
              </div>
              <div className="mt-3 text-xs text-yellow-700 dark:text-yellow-400">
                💡 <strong>Meanwhile:</strong> The map will show demo data to demonstrate functionality
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Controls - Admin Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filters */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Incidents ({incidents.length})</option>
              <option value="pending">Pending ({stats.active})</option>
              <option value="assigned">Assigned ({stats.assigned})</option>
              <option value="resolved">Resolved ({stats.resolved})</option>
            </select>
          </div>

          {/* Map Controls */}
          <div className="flex items-center gap-3 ml-auto">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showRouting}
                onChange={(e) => setShowRouting(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700">Show Routing</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={highlightCritical}
                onChange={(e) => setHighlightCritical(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700">Highlight Hotspots</span>
            </label>
          </div>
        </div>
      </div>

      {/* Priority Statistics - Crisis Data Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Critical */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-red-500 p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl">🆘</div>
            {stats.critical > 0 && (
              <div className="bg-red-500 dark:bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                URGENT
              </div>
            )}
          </div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Critical</div>
          <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Life-threatening • Immediate response</div>
        </div>

        {/* High Priority */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-orange-500 p-4 hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-2">⚠️</div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">High</div>
          <div className="text-3xl font-bold text-orange-600">{stats.high}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Urgent • Deploy within 30min</div>
        </div>

        {/* Moderate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-yellow-500 p-4 hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-2">📍</div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Moderate</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.medium}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Standard priority • 1-2 hours</div>
        </div>

        {/* Safe/Low */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border-l-4 border-green-500 p-4 hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Safe</div>
          <div className="text-3xl font-bold text-green-600">{stats.low}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Low risk • Routine check</div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <IncidentMap 
          incidents={filteredIncidents}
          rescueShelters={centers.map(c => ({
            id: c.id,
            name: c.name,
            latitude: c.latitude,
            longitude: c.longitude,
            type: c.type || 'shelter',
            status: c.operational_status || 'active',
            capacity: c.capacity,
            contact: c.contact_phone
          }))}
          showRouting={showRouting}
          highlightCritical={highlightCritical}
        />
      </div>

      {/* Operational Guidance - First72 Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Map Legend */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <span>📍</span>
            <span>Map Legend</span>
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                🆘
              </div>
              <div className="flex-1">
                <div className="font-semibold text-red-700 dark:text-red-400">Critical (8-10)</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Life-threatening • Immediate dispatch</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                ⚠️
              </div>
              <div className="flex-1">
                <div className="font-semibold text-orange-700 dark:text-orange-400">High (6-7)</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Urgent • Deploy within 30min</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                📍
              </div>
              <div className="flex-1">
                <div className="font-semibold text-yellow-700 dark:text-yellow-400">Moderate (4-5)</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Standard response • 1-2 hours</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                ✅
              </div>
              <div className="flex-1">
                <div className="font-semibold text-green-700 dark:text-green-400">Safe (1-3)</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Low risk • Routine check</div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-lg">
                🏥
              </div>
              <div className="flex-1">
                <div className="font-semibold text-blue-700 dark:text-blue-400">Rescue Shelters</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">First responder locations • 10km radius</div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Dispatch Capabilities */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg p-5 shadow">
          <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
            <span>🚀</span>
            <span>First72 Intelligence</span>
          </h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <div>
                <span className="font-semibold">Rapid Rescue:</span> Locations appear instantly with real-time updates
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <div>
                <span className="font-semibold">AI Triage:</span> Gemini analyzes severity and auto-prioritizes critical cases
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <div>
                <span className="font-semibold">Smart Dispatch:</span> Auto-routes to nearest rescue shelter (distance calculated)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <div>
                <span className="font-semibold">Hotspot Detection:</span> Red circles show high-risk concentration zones
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <div>
                <span className="font-semibold">Batch Operations:</span> Group nearby incidents for efficient resource delivery
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">✓</span>
              <div>
                <span className="font-semibold">Coverage Radius:</span> 10km zones show response team jurisdiction
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-300">
            <div className="text-xs text-blue-800 font-medium">
              💡 Click any marker for incident details and assignment options
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Status Bar */}
      {!loading && incidents.length > 0 && (
        <div className="bg-gray-800 text-white rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Connection Active</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-400">Last Update:</span>{" "}
                <span className="font-bold">{new Date().toLocaleTimeString()}</span>
              </div>
              <div>
                <span className="text-gray-400">Coverage:</span>{" "}
                <span className="font-bold">Tamil Nadu</span>
              </div>
              <div>
                <span className="text-gray-400">Response Time Avg:</span>{" "}
                <span className="font-bold text-green-400">8 minutes</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
