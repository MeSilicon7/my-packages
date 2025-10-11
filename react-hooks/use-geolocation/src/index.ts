import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Geolocation coordinates interface containing position information
 */
interface GeolocationCoordinates {
  /** Latitude in decimal degrees */
  latitude: number;
  /** Longitude in decimal degrees */
  longitude: number;
  /** Accuracy of the position in meters */
  accuracy: number;
  /** Altitude in meters above sea level (may be null if not available) */
  altitude?: number | null;
  /** Accuracy of the altitude in meters (may be null if not available) */
  altitudeAccuracy?: number | null;
  /** Direction of travel in degrees (0-360, may be null if not available) */
  heading?: number | null;
  /** Speed in meters per second (may be null if not available) */
  speed?: number | null;
}

/**
 * Configuration options for the geolocation hook
 */
interface UseGeolocationOptions {
  /** Request high accuracy positioning (uses more battery) */
  enableHighAccuracy?: boolean;
  /** Maximum time in milliseconds to wait for a position */
  timeout?: number;
  /** Maximum age in milliseconds of a cached position */
  maximumAge?: number;
  /** Whether to immediately fetch position on mount (default: true) */
  immediate?: boolean;
}

/**
 * Browser permission state for geolocation access
 */
type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

/**
 * Return value interface for the useGeolocation hook
 */
interface UseGeolocationResult {
  /** Current position coordinates (null if not available) */
  coordinates: GeolocationCoordinates | null;
  /** Whether a position request is currently in progress */
  loading: boolean;
  /** Error message if position request failed (null if no error) */
  error: string | null;
  /** Whether geolocation is supported by the browser */
  supported: boolean;
  /** Timestamp of the last successful position update */
  timestamp: number | null;
  /** Current permission state for geolocation access */
  permission: PermissionState;
  /** Whether position watching is currently active */
  watching: boolean;
  /** Function to manually refresh the current position */
  refresh: () => void;
  /** Function to start watching position changes */
  watch: () => void;
  /** Function to stop watching position changes */
  stopWatching: () => void;
}

/**
 * React hook for accessing device geolocation with comprehensive state management
 *
 * @param options - Configuration options for geolocation behavior
 * @returns Object containing coordinates, loading state, error handling, and control functions
 *
 * @example
 * ```tsx
 * import { useGeolocation } from '@your-package/use-geolocation';
 *
 * function LocationComponent() {
 *   const { coordinates, loading, error, refresh, watch, stopWatching } = useGeolocation({
 *     enableHighAccuracy: true,
 *     timeout: 10000,
 *     immediate: true
 *   });
 *
 *   if (loading) return <div>Getting your location...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   if (!coordinates) return <div>No location data</div>;
 *
 *   return (
 *     <div>
 *       <p>Latitude: {coordinates.latitude}</p>
 *       <p>Longitude: {coordinates.longitude}</p>
 *       <button onClick={refresh}>Refresh Location</button>
 *       <button onClick={watch}>Start Watching</button>
 *       <button onClick={stopWatching}>Stop Watching</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useGeolocation(
  options: UseGeolocationOptions = {}
): UseGeolocationResult {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false); // Start with false for SSR
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [permission, setPermission] = useState<PermissionState>('prompt');
  const [watching, setWatching] = useState(false); // Add watching state

  const watchIdRef = useRef<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Initialize client-side only values
  useEffect(() => {
    setIsClient(true);
    setSupported(typeof navigator !== 'undefined' && 'geolocation' in navigator);
  }, []);

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const { coords, timestamp } = position;

    setCoordinates({
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      altitudeAccuracy: coords.altitudeAccuracy,
      heading: coords.heading,
      speed: coords.speed,
    });

    setTimestamp(timestamp);
    setLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let message: string;
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'User denied the request for Geolocation';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Location information is unavailable';
        break;
      case error.TIMEOUT:
        message = 'The request to get user location timed out';
        break;
      default:
        message = 'An unknown error occurred while retrieving location';
    }
    setError(message);
    setLoading(false);
  }, []);

  const getPosition = useCallback(() => {
    if (!isClient || !supported) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    const {
      enableHighAccuracy = false,
      timeout = 10000,
      maximumAge = 0,
    } = options;

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy,
      timeout,
      maximumAge,
    });
  }, [isClient, supported, handleSuccess, handleError]);

  const watch = useCallback(() => {
    if (!isClient || !supported || watchIdRef.current !== null) return;

    const {
      enableHighAccuracy = false,
      timeout = 10000,
      maximumAge = 0,
    } = options;

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy, timeout, maximumAge }
    );
    setWatching(true); // Set watching to true when starting
  }, [isClient, supported, handleSuccess, handleError]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setWatching(false); // Set watching to false when stopping
  }, []);

  const refresh = useCallback(() => {
    stopWatching();
    getPosition();
  }, [getPosition, stopWatching]);

  // Handle permission status - only on client
  useEffect(() => {
    if (!isClient || typeof navigator === 'undefined' || !('permissions' in navigator)) {
      setPermission('unsupported');
      return;
    }

    (navigator as any).permissions
      ?.query({ name: 'geolocation' })
      .then((status: PermissionStatus) => {
        setPermission(status.state as PermissionState);
        status.onchange = () => setPermission(status.state as PermissionState);
      })
      .catch(() => setPermission('unsupported'));
  }, [isClient]);

  // Only fetch initial position if immediate option is true and on client
  useEffect(() => {
    if (isClient && options.immediate !== false) {
      getPosition();
    }
    return stopWatching;
  }, [isClient]);

  return {
    coordinates,
    loading,
    error,
    supported,
    timestamp,
    permission,
    watching, // Include watching in return
    refresh,
    watch,
    stopWatching,
  };
}
