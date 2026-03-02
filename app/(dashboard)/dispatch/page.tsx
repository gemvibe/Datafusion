export default function DispatchPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tamil Nadu Smart Dispatch</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Coordinate response teams and relief efforts across Tamil Nadu</p>
        </div>
      </div>

      {/* Dispatch Queue - Kanban Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pending */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 transition-colors duration-200">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Pending Assignment</h3>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-3xl mb-2">📥</div>
            <p className="text-sm">0 incidents</p>
          </div>
        </div>

        {/* Assigned */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 transition-colors duration-200">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Assigned</h3>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-sm">0 incidents</p>
          </div>
        </div>

        {/* En Route */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 transition-colors duration-200">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">En Route</h3>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-3xl mb-2">🚗</div>
            <p className="text-sm">0 incidents</p>
          </div>
        </div>

        {/* On Scene */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 transition-colors duration-200">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">On Scene</h3>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm">0 incidents</p>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors duration-200">
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Dispatch Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">🎯</span>
            <div>
              <div className="font-medium dark:text-gray-100">Nearest Center Routing</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Automatic assignment based on distance</div>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚖️</span>
            <div>
              <div className="font-medium dark:text-gray-100">Load-Aware Selection</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Balance workload across centers</div>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">🚑</span>
            <div>
              <div className="font-medium dark:text-gray-100">Medical Fast-Track</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Priority for critical medical emergencies</div>
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-2xl mr-3">📊</span>
            <div>
              <div className="font-medium dark:text-gray-100">ETA Prediction</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Real-time arrival estimates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
