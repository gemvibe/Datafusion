export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Responder Teams</h1>
          <p className="text-gray-600 mt-1">Manage field response teams and personnel</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          ➕ Add Team Member
        </button>
      </div>

      {/* Team Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="text-3xl mb-2">🟢</div>
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="text-3xl mb-2">🔵</div>
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-gray-600">On Mission</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <div className="text-3xl mb-2">⚪</div>
            <div className="text-2xl font-bold">0</div>
            <div className="text-sm text-gray-600">Off Duty</div>
          </div>
        </div>
      </div>

      {/* Teams List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-8 text-center text-gray-500">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Teams Yet</h3>
          <p className="text-gray-600">Add responders to build your emergency response teams</p>
        </div>
      </div>
    </div>
  );
}
