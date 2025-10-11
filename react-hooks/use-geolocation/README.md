# useGeolocation Hook

A Simple and efficient React hook for accessing and managing geolocation data in your applications.

[![npm version](https://badge.fury.io/js/@mesilicon7%2Fuse-geolocation.svg?icon=si%3Anpm)](https://badge.fury.io/js/@mesilicon7%2Fuse-geolocation)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@mesilicon7/use-geolocation)
![license](https://img.shields.io/npm/l/@mesilicon7/use-geolocation)

## Features

- 🌍 **Current Position**: Get device's current location
- 👁️ **Position Watching**: Monitor location changes in real-time
- 🔒 **Permission Handling**: Track and respond to permission states
- ⚡ **High Performance**: Optimized with proper cleanup and caching
- 🛡️ **Type Safe**: Full TypeScript support with detailed interfaces
- 🖥️ **SSR Compatible**: Safe for server-side rendering
- 🔄 **Flexible Configuration**: Customizable accuracy, timeout, and caching options

## Installation

```bash
npm install @mesilicon7/use-geolocation
# or
yarn add @mesilicon7/use-geolocation
# or
pnpm add @mesilicon7/use-geolocation
```

## Basic Usage

```tsx
import { useGeolocation } from '@mesilicon7/use-geolocation';

function LocationComponent() {
  const { coordinates, loading, error, supported } = useGeolocation();

  if (!supported) {
    return <div>Geolocation is not supported by this browser</div>;
  }

  if (loading) {
    return <div>Getting your location...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!coordinates) {
    return <div>No location data available</div>;
  }

  return (
    <div>
      <h2>Your Location</h2>
      <p>Latitude: {coordinates.latitude}</p>
      <p>Longitude: {coordinates.longitude}</p>
      <p>Accuracy: {coordinates.accuracy} meters</p>
    </div>
  );
}
```

## Advanced Usage

### With Custom Options

```tsx
import { useGeolocation } from '@mesilicon7/use-geolocation';

function AdvancedLocationComponent() {
  const { 
    coordinates, 
    loading, 
    error, 
    permission, 
    refresh, 
    watch, 
    stopWatching, 
    watching 
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 30000,
    immediate: false // Don't fetch location immediately
  });

  return (
    <div>
      <div>Permission: {permission}</div>
      <div>Watching: {watching ? 'Yes' : 'No'}</div>
      
      {coordinates && (
        <div>
          <p>Lat: {coordinates.latitude}</p>
          <p>Lng: {coordinates.longitude}</p>
          {coordinates.altitude && <p>Alt: {coordinates.altitude}m</p>}
          {coordinates.speed && <p>Speed: {coordinates.speed} m/s</p>}
        </div>
      )}
      
      <button onClick={refresh} disabled={loading}>
        {loading ? 'Getting Location...' : 'Get Location'}
      </button>
      
      <button onClick={watching ? stopWatching : watch}>
        {watching ? 'Stop Watching' : 'Start Watching'}
      </button>
      
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
```

### Real-time Location Tracking

```tsx
import { useGeolocation } from '@mesilicon7/use-geolocation';
import { useEffect } from 'react';

function LocationTracker() {
  const { coordinates, watch, stopWatching, watching, error } = useGeolocation({
    enableHighAccuracy: true,
    immediate: false
  });

  useEffect(() => {
    // Start watching location changes
    watch();
    
    // Cleanup on unmount
    return () => stopWatching();
  }, [watch, stopWatching]);

  return (
    <div>
      <h2>Real-time Location Tracking</h2>
      <p>Status: {watching ? 'Tracking...' : 'Not tracking'}</p>
      
      {coordinates && (
        <div>
          <p>Current Position:</p>
          <p>Lat: {coordinates.latitude.toFixed(6)}</p>
          <p>Lng: {coordinates.longitude.toFixed(6)}</p>
          <p>Accuracy: ±{coordinates.accuracy}m</p>
        </div>
      )}
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
}
```

## API Reference

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enableHighAccuracy` | `boolean` | `false` | Request high accuracy positioning (uses more battery) |
| `timeout` | `number` | `10000` | Maximum time in milliseconds to wait for a position |
| `maximumAge` | `number` | `0` | Maximum age in milliseconds of a cached position |
| `immediate` | `boolean` | `true` | Whether to fetch position immediately on mount |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `coordinates` | `GeolocationCoordinates \| null` | Current position coordinates |
| `loading` | `boolean` | Whether a position request is in progress |
| `error` | `string \| null` | Error message if request failed |
| `supported` | `boolean` | Whether geolocation is supported |
| `timestamp` | `number \| null` | Timestamp of last successful update |
| `permission` | `PermissionState` | Current permission state |
| `watching` | `boolean` | Whether position watching is active |
| `refresh` | `() => void` | Function to manually refresh position |
| `watch` | `() => void` | Function to start watching position changes |
| `stopWatching` | `() => void` | Function to stop watching position changes |

### GeolocationCoordinates

```typescript
interface GeolocationCoordinates {
  latitude: number;           // Latitude in decimal degrees
  longitude: number;          // Longitude in decimal degrees
  accuracy: number;           // Accuracy in meters
  altitude?: number | null;   // Altitude in meters (if available)
  altitudeAccuracy?: number | null; // Altitude accuracy in meters (if available)
  heading?: number | null;    // Direction of travel in degrees (0-360)
  speed?: number | null;      // Speed in meters per second
}
```

### PermissionState

```typescript
type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';
```

## Error Handling

The hook provides detailed error messages for different failure scenarios:

- **Permission Denied**: "User denied the request for Geolocation"
- **Position Unavailable**: "Location information is unavailable"
- **Timeout**: "The request to get user location timed out"
- **Not Supported**: "Geolocation is not supported by this browser"

```tsx
function LocationWithErrorHandling() {
  const { coordinates, error, permission, refresh } = useGeolocation();

  if (permission === 'denied') {
    return (
      <div>
        <p>Location access denied. Please enable location permissions in your browser.</p>
        <button onClick={refresh}>Try Again</button>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p>Failed to get location: {error}</p>
        <button onClick={refresh}>Retry</button>
      </div>
    );
  }

  // ... rest of component
}
```

## Best Practices

### 1. Handle Permissions Gracefully

Always check permission state and provide clear user feedback:

```tsx
const { permission, coordinates, error } = useGeolocation();

if (permission === 'denied') {
  return <div>Please enable location access to use this feature</div>;
}
```

### 2. Use High Accuracy Sparingly

Enable high accuracy only when needed as it consumes more battery:

```tsx
// For precise navigation
const { coordinates } = useGeolocation({ enableHighAccuracy: true });

// For general location (default)
const { coordinates } = useGeolocation({ enableHighAccuracy: false });
```

### 3. Set Appropriate Timeouts

Configure timeouts based on your use case:

```tsx
// Quick response for UI updates
const { coordinates } = useGeolocation({ timeout: 5000 });

// Allow more time for accurate positioning
const { coordinates } = useGeolocation({ timeout: 30000, enableHighAccuracy: true });
```

### 4. Clean Up Watchers

Always stop watching when component unmounts:

```tsx
useEffect(() => {
  watch();
  return () => stopWatching();
}, [watch, stopWatching]);
```

### 5. Handle SSR

The hook is SSR-safe and will only activate on the client side:

```tsx
const { supported, coordinates } = useGeolocation();

// supported will be false during SSR, true on client if available
if (!supported) {
  return <div>Geolocation not available</div>;
}
```

## Browser Support

- **Chrome**: ✅ Full support
- **Firefox**: ✅ Full support  
- **Safari**: ✅ Full support
- **Edge**: ✅ Full support
- **Opera**: ✅ Full support
- **Mobile Browsers**: ✅ Full support

**Note**: HTTPS is required for geolocation to work in modern browsers.

## License

MIT © @mesilicon7
