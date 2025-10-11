import { useNetworkStatus } from "@mesilicon7/use-network-status";

export default function CheckOnlineDemo() {
  const isConnected = useNetworkStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Online Status Demo
        </h1>
        
        <div className="flex flex-col items-center space-y-6">
          {/* Status Indicator */}
          <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
            isConnected 
              ? 'bg-green-100 border-4 border-green-400' 
              : 'bg-red-100 border-4 border-red-400'
          }`}>
            <div className={`w-16 h-16 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {isConnected && (
                <div className="w-full h-full rounded-full bg-green-500 animate-ping absolute"></div>
              )}
            </div>
          </div>

          {/* Status Text */}
          <div className="text-center">
            <h2 className={`text-2xl font-semibold ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              {isConnected ? 'Online' : 'Offline'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isConnected
                ? 'You are connected to the internet'
                : 'No internet connection detected'
              }
            </p>
          </div>

          {/* Test Instructions */}
          <div className="bg-gray-50 rounded-lg p-4 w-full">
            <h3 className="font-semibold text-gray-800 mb-2">Test the Demo:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Turn off your WiFi or disconnect ethernet</li>
              <li>• Watch the status change automatically</li>
              <li>• Reconnect to see it go back online</li>
            </ul>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-500">
            <p>This demo uses the Navigator.onLine API</p>
            <p>Status updates in real-time</p>
          </div>
        </div>
      </div>
    </div>
  );
}


