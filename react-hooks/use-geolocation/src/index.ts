import { useState, useEffect, useCallback, useRef } from 'react';

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  immediate?: boolean; // Add option to control immediate fetching
}

type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

interface UseGeolocationResult {
  coordinates: GeolocationCoordinates | null;
  loading: boolean;
  error: string | null;
  supported: boolean;
  timestamp: number | null;
  permission: PermissionState;
  watching: boolean; // Add watching status
  refresh: () => void;
  watch: () => void;
  stopWatching: () => void;
}

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
