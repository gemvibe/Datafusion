export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incidents</h1>
          <p className="text-gray-600 mt-1">Manage and triage all reported incidents</p>
        </div>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          🆘 Report New Incident
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-4">
          <select className="px-4 py-2 border rounded-md">
            <option>All Urgency</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <select className="px-4 py-2 border rounded-md">
            <option>All Types</option>
            <option>Medical</option>
            <option>Fire</option>
            <option>Flood</option>
            <option>Earthquake</option>
            <option>Accident</option>
          </select>
          <select className="px-4 py-2 border rounded-md">
            <option>All Status</option>
            <option>Pending</option>
            <option>Assigned</option>
            <option>En Route</option>
            <option>On Scene</option>
            <option>Resolved</option>
          </select>
        </div>
      </div>

      {/* Incidents List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center text-gray-500">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Incidents Yet</h3>
          <p className="text-gray-600">Start by reporting an incident or wait for incoming reports</p>
        </div>
      </div>
    </div>
  );
}
