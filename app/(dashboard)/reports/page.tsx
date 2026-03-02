export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and view system reports</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          📄 Generate Report
        </button>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="font-semibold text-lg mb-2">Daily Summary</h3>
          <p className="text-sm text-gray-600">Overview of daily operations and incidents</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-4xl mb-3">📈</div>
          <h3 className="font-semibold text-lg mb-2">Performance Report</h3>
          <p className="text-sm text-gray-600">Response times and team efficiency</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-4xl mb-3">🗺️</div>
          <h3 className="font-semibold text-lg mb-2">Hotspot Analysis</h3>
          <p className="text-sm text-gray-600">Geographic incident distribution</p>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Reports</h2>
        </div>
        <div className="p-8 text-center text-gray-500">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
          <p className="text-gray-600">Generate your first report to see it here</p>
        </div>
      </div>
    </div>
  );
}
