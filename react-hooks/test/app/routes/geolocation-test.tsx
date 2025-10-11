import { useEffect, useState } from "react";
import { useGeolocation } from "@mesilicon7/use-geolocation";

export default function App() {
  const [ mounted, setMounted ] = useState(false);
  
  const {
    coordinates,
    loading,
    error,
    supported,
    timestamp,
    permission,
    watching, // Add watching status
    refresh,
    watch,
    stopWatching,
  } = useGeolocation({ 
    enableHighAccuracy: true,
    immediate: false // Prevent automatic fetching
  });

  // Ensure component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Start watching on mount instead of auto-fetching
  useEffect(() => {
    if (mounted) {
      watch();
      return () => stopWatching();
    }
  }, [mounted]);

  // Show loading during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-xl p-6 space-y-6 border border-gray-800">
          <h1 className="text-2xl font-bold text-center text-blue-400">
            🌍 Geolocation Tracker
          </h1>
          <div className="text-center text-blue-300 animate-pulse">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-xl p-6 space-y-6 border border-gray-800">
        <h1 className="text-2xl font-bold text-center text-blue-400">
          🌍 Geolocation Tracker
        </h1>

        {!supported && (
          <div className="text-red-400 text-center">
            ❌ Geolocation is not supported by your browser.
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center text-blue-300 animate-pulse">
            Fetching location...
          </div>
        )}

        {coordinates && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Latitude:</span>
              <span className="font-mono">
                {coordinates.latitude.toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Longitude:</span>
              <span className="font-mono">
                {coordinates.longitude.toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Accuracy:</span>
              <span className="font-mono">{coordinates.accuracy} m</span>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center space-y-2 text-sm text-gray-400">
          <div>
            Permission: <span className="text-blue-400">{permission}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Watching:</span>
            <span className={`font-semibold ${watching ? 'text-green-400' : 'text-red-400'}`}>
              {watching ? '🟢 Active' : '🔴 Inactive'}
            </span>
          </div>
          {timestamp && (
            <div>
              Last updated:{" "}
              <span className="text-gray-300">
                {new Date(timestamp).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-center space-x-3 pt-4">
          <button
            onClick={refresh}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition"
          >
            Refresh
          </button>
          <button
            onClick={watch}
            disabled={watching}
            className={`px-4 py-2 rounded-lg transition ${
              watching 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-500 active:bg-green-700'
            }`}
          >
            {watching ? 'Watching...' : 'Start Watch'}
          </button>
          <button
            onClick={stopWatching}
            disabled={!watching}
            className={`px-4 py-2 rounded-lg transition ${
              !watching 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-500 active:bg-red-700'
            }`}
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
