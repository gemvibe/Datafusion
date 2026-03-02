"use client";

import dynamic from "next/dynamic";
import { useIncidents } from "@/lib/hooks/useIncidents";
import { useMemo, useState } from "react";

// Import map component with no SSR to avoid "window is not defined" error
const IncidentMap = dynamic(
  () => import("@/components/shared/IncidentMap").then((mod) => mod.IncidentMap),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading Admin Command Map...</div>
      </div>
    )
  }
);

export default function AdminMapPage() {
  const { incidents, loading, error } = useIncidents();
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
    const critical = incidents.filter((i) => (i.urgency_score || 0) >= 8).length;
    const high = incidents.filter((i) => (i.urgency_score || 0) >= 6 && (i.urgency_score || 0) < 8).length;
    const medium = incidents.filter((i) => (i.urgency_score || 0) >= 4 && (i.urgency_score || 0) < 6).length;
    const low = incidents.filter((i) => (i.urgency_score || 0) < 4 && (i.urgency_score || 0) > 0).length;
    const total = incidents.length;
    const pending = incidents.filter(i => i.status === "pending").length;
    const assigned = incidents.filter(i => i.status === "assigned").length;
    const resolved = incidents.filter(i => i.status === "resolved").length;

    return { critical, high, medium, low, total, pending, assigned, resolved };
  }, [incidents]);

  return (
    <div className="space-y-4">
      {/* Header with Live Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🗺️ Admin Command Center Map</h1>
          <p className="text-gray-600 mt-1">
            Real-time disaster monitoring and response coordination across Tamil Nadu
            {!loading && <span className="ml-2 font-semibold text-purple-600">{stats.pending} Pending</span>}
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <div className="animate-spin">⟳</div>
            <span>Syncing live data...</span>
          </div>
        )}
        {!loading && incidents.length > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">Total Reports</div>
          </div>
        )}
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
                <div className="font-semibold mb-1">📝 To fix this:</div>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Go to Supabase SQL Editor</li>
                  <li>Run the <code className="bg-yellow-200 px-1 rounded">supabase/schema-no-rls.sql</code> file</li>
                  <li>This will create required tables</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Controls - Admin Panel */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filters */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="all">All Disasters ({incidents.length})</option>
              <option value="pending">Pending ({stats.pending})</option>
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
                className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="font-medium text-gray-700">Show Routing</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={highlightCritical}
                onChange={(e) => setHighlightCritical(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
              />
              <span className="font-medium text-gray-700">Highlight Hotspots</span>
            </label>
          </div>
        </div>
      </div>

      {/* Priority Statistics - Admin Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Critical */}
        <div className="bg-white rounded-lg shadow-md border-l-4 border-red-500 p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-3xl">🆘</div>
            {stats.critical > 0 && (
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                URGENT
              </div>
            )}
          </div>
          <div className="text-sm font-medium text-gray-600 mb-1">Critical</div>
          <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-xs text-gray-500 mt-1">Severity 8-10 • Immediate action</div>
        </div>

        {/* High Priority */}
        <div className="bg-white rounded-lg shadow-md border-l-4 border-orange-500 p-4 hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-2">⚠️</div>
          <div className="text-sm font-medium text-gray-600 mb-1">High</div>
          <div className="text-3xl font-bold text-orange-600">{stats.high}</div>
          <div className="text-xs text-gray-500 mt-1">Severity 6-7 • Deploy teams</div>
        </div>

        {/* Moderate */}
        <div className="bg-white rounded-lg shadow-md border-l-4 border-yellow-500 p-4 hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-2">📍</div>
          <div className="text-sm font-medium text-gray-600 mb-1">Moderate</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.medium}</div>
          <div className="text-xs text-gray-500 mt-1">Severity 4-5 • Standard</div>
        </div>

        {/* Low */}
        <div className="bg-white rounded-lg shadow-md border-l-4 border-green-500 p-4 hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-sm font-medium text-gray-600 mb-1">Low</div>
          <div className="text-3xl font-bold text-green-600">{stats.low}</div>
          <div className="text-xs text-gray-500 mt-1">Severity 1-3 • Monitoring</div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <IncidentMap 
          incidents={filteredIncidents} 
          showRouting={showRouting}
          highlightCritical={highlightCritical}
        />
      </div>

      {/* Admin Intelligence Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Map Legend */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>📍</span>
            <span>Map Legend</span>
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                🆘
              </div>
              <div className="flex-1">
                <div className="font-semibold text-red-700">Critical (8-10)</div>
                <div className="text-xs text-gray-600">Life-threatening disasters</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                ⚠️
              </div>
              <div className="flex-1">
                <div className="font-semibold text-orange-700">High (6-7)</div>
                <div className="text-xs text-gray-600">Urgent response needed</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                📍
              </div>
              <div className="flex-1">
                <div className="font-semibold text-yellow-700">Moderate (4-5)</div>
                <div className="text-xs text-gray-600">Standard monitoring</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                ✅
              </div>
              <div className="flex-1">
                <div className="font-semibold text-green-700">Low (1-3)</div>
                <div className="text-xs text-gray-600">Routine check</div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-lg">
                🏥
              </div>
              <div className="flex-1">
                <div className="font-semibold text-blue-700">Rescue Shelters</div>
                <div className="text-xs text-gray-600">Response team locations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Capabilities */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-5 shadow">
          <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
            <span>⚡</span>
            <span>Admin Command Features</span>
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">✓</span>
              <div>
                <span className="font-semibold">Real-time Sync:</span> Instant updates from all disaster reports
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">✓</span>
              <div>
                <span className="font-semibold">Severity Analysis:</span> Auto-prioritization based on urgency scores
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">✓</span>
              <div>
                <span className="font-semibold">Resource Routing:</span> Optimal paths to nearest rescue shelters
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">✓</span>
              <div>
                <span className="font-semibold">Hotspot Detection:</span> Identify high-concentration disaster zones
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">✓</span>
              <div>
                <span className="font-semibold">Coverage Analysis:</span> 10km response radius visualization
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">✓</span>
              <div>
                <span className="font-semibold">Coordinate Operations:</span> Click markers for detailed incident management
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-purple-300">
            <div className="text-xs text-purple-800 font-medium">
              💡 Admin view shows all incidents with full management capabilities
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Status Bar */}
      {!loading && incidents.length > 0 && (
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Admin Console • Live Connection</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-purple-200">Last Update:</span>{" "}
                <span className="font-bold">{new Date().toLocaleTimeString()}</span>
              </div>
              <div>
                <span className="text-purple-200">Coverage:</span>{" "}
                <span className="font-bold">Tamil Nadu State</span>
              </div>
              <div>
                <span className="text-purple-200">Response Avg:</span>{" "}
                <span className="font-bold text-green-300">8 min</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
