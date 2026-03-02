export default function CentersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relief Centers</h1>
          <p className="text-gray-600 mt-1">Manage emergency response facilities</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          ➕ Add Center
        </button>
      </div>

      {/* Centers Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center text-gray-500">
          <div className="text-6xl mb-4">🏥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Relief Centers Yet</h3>
          <p className="text-gray-600 mb-4">Add your first relief center to start coordinating responses</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create First Center
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Center Management Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-3xl mb-2">📍</div>
            <div className="font-medium">Location Tracking</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-3xl mb-2">📦</div>
            <div className="font-medium">Resource Inventory</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-3xl mb-2">👥</div>
            <div className="font-medium">Staff Management</div>
          </div>
        </div>
      </div>
    </div>
  );
}
