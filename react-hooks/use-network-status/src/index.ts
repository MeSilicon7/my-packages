import { useState, useEffect } from 'react';

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