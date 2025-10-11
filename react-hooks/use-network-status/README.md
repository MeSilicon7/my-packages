# @mesilicon7/use-network-status

A lightweight React hook for monitoring network connection status in real-time.

## Installation

```bash
npm install @mesilicon7/use-network-status
```

```bash
yarn add @mesilicon7/use-network-status
```

```bash
pnpm add @mesilicon7/use-network-status
```

## Usage

```tsx
import React from 'react';
import { useNetworkStatus } from '@mesilicon7/use-network-status';

function App() {
  const isOnline = useNetworkStatus();

  return (
    <div>
      <h1>Network Status: {isOnline ? 'Online' : 'Offline'}</h1>
      {!isOnline && (
        <div style={{ color: 'red' }}>
          ⚠️ You are currently offline. Some features may not work.
        </div>
      )}
    </div>
  );
}

export default App;
```

## API

### `useNetworkStatus()`

A React hook that returns the current network connection status.

**Returns:** `boolean`
- `true` - The browser is online
- `false` - The browser is offline

**Example:**

```tsx
function NetworkIndicator() {
  const isConnected = useNetworkStatus();
  
  return (
    <div className={`indicator ${isConnected ? 'online' : 'offline'}`}>
      {isConnected ? '🟢 Online' : '🔴 Offline'}
    </div>
  );
}
```

## Features

- 🚀 **Lightweight** - Minimal bundle size
- ⚡ **Real-time** - Automatically updates when network status changes
- 🧹 **Clean** - Automatically handles event listener cleanup
- 💪 **TypeScript** - Full TypeScript support
- 🔄 **SSR Safe** - Works with server-side rendering

## How it works

The hook:
1. Initializes with the current network status using `navigator.onLine`
2. Sets up event listeners for `online` and `offline` events
3. Updates the state when network status changes
4. Automatically cleans up event listeners on unmount

## Browser Support

This hook relies on the `navigator.onLine` property and `online`/`offline` events, which are supported in all modern browsers.

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.
