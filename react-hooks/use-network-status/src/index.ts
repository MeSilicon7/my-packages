import { useState, useEffect } from 'react';

/**
 * A React hook that monitors the network connection status of the browser.
 *
 * @returns {boolean} Returns `true` when the browser is online, `false` when offline.
 *
 * @example
 * ```tsx
 * import { useNetworkStatus } from './useNetworkStatus';
 *
 * function App() {
 *   const isOnline = useNetworkStatus();
 *
 *   return (
 *     <div>
 *       <p>Network status: {isOnline ? 'Online' : 'Offline'}</p>
 *       {!isOnline && <div>You are currently offline</div>}
 *     </div>
 *   );
 * }
 *
 * @remarks
 * This hook automatically sets up event listeners for the browser's 'online' and 'offline' events
 * and cleans them up when the component unmounts. The initial state is determined by `navigator.onLine`.
 */
export function useNetworkStatus(): boolean {
  const [isConnected, setIsConnected] = useState(navigator.onLine);

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    window.addEventListener('online', handleConnect);
    window.addEventListener('offline', handleDisconnect);

    return () => {
      window.removeEventListener('online', handleConnect);
      window.removeEventListener('offline', handleDisconnect);
    };
  }, []);

  return isConnected;
}