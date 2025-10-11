# @mesilicon7/use-user-activity

A React hook for tracking user activity and idle state based on page visibility, window focus, and user interactions.

## Installation

```bash
npm install @mesilicon7/use-user-activity
```

```bash
yarn add @mesilicon7/use-user-activity
```

```bash
pnpm add @mesilicon7/use-user-activity
```

## Usage

```tsx
import React from 'react';
import { useUserActivity } from '@mesilicon7/use-user-activity';

function App() {
  const { isActive, isIdle, isVisible, lastActiveAt } = useUserActivity({
    idleTimeout: 30000 // 30 seconds
  });

  return (
    <div>
      <h1>User Activity Monitor</h1>
      <p>Status: {isActive ? '🟢 Active' : '🔴 Inactive'}</p>
      <p>User is {isIdle ? '😴 idle' : '⚡ active'}</p>
      <p>Page is {isVisible ? '👁️ visible' : '🙈 hidden'}</p>
      <p>Last active: {new Date(lastActiveAt).toLocaleTimeString()}</p>
      
      {isIdle && (
        <div style={{ color: 'orange' }}>
          ⏰ User has been idle for a while
        </div>
      )}
    </div>
  );
}
```

## API

### `useUserActivity(options?)`

**Parameters:**
- `options` (optional): Configuration object
  - `idleTimeout` (number): Time in milliseconds after which user is considered idle. Default: `60000` (60 seconds)

**Returns:** Object with the following properties:
- `isActive` (boolean): `true` when user is both visible and not idle
- `isIdle` (boolean): `true` when user has been inactive for longer than `idleTimeout`
- `isVisible` (boolean): `true` when page is visible and window has focus
- `lastActiveAt` (number): Timestamp of the last user activity

## Examples

### Auto-pause Video

```tsx
import { useUserActivity } from '@mesilicon7/use-user-activity';

function VideoPlayer() {
  const { isActive } = useUserActivity({ idleTimeout: 10000 });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isActive && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive]);

  return <video ref={videoRef} controls />;
}
```

### Idle Warning

```tsx
function IdleWarning() {
  const { isIdle, lastActiveAt } = useUserActivity({ idleTimeout: 60000 });
  
  if (!isIdle) return null;
  
  const idleTime = Math.floor((Date.now() - lastActiveAt) / 1000);
  
  return (
    <div className="idle-warning">
      ⚠️ You've been idle for {idleTime} seconds
    </div>
  );
}
```

### Session Management

```tsx
function SessionManager() {
  const { isActive, isIdle } = useUserActivity({ idleTimeout: 300000 }); // 5 minutes
  
  useEffect(() => {
    if (isIdle) {
      // Auto-logout after 5 minutes of inactivity
      logout();
    }
  }, [isIdle]);
  
  return (
    <div>
      Session status: {isActive ? 'Active' : 'Will expire soon'}
    </div>
  );
}
```

## How it Works

The hook tracks user activity through multiple mechanisms:

### **Activity Detection**
- **Mouse movements** (`mousemove`)
- **Key presses** (`keydown`)
- **Mouse clicks** (`mousedown`)
- **Touch events** (`touchstart`)

### **Visibility Detection**
- **Page visibility** (using `document.hidden`)
- **Window focus** (using `document.hasFocus()`)
- **Focus/blur events** on the window

### **State Logic**
- `isVisible`: Page is visible AND window has focus
- `isIdle`: No activity detected for `idleTimeout` milliseconds
- `isActive`: User is visible AND not idle
- `lastActiveAt`: Timestamp updated on any detected activity

## Features

- 🎯 **Multi-factor Detection** - Tracks mouse, keyboard, touch, and visibility
- ⚡ **Real-time Updates** - Responds immediately to user activity
- 🧹 **Auto Cleanup** - Handles all event listener management
- 💪 **TypeScript** - Full TypeScript support with detailed types
- 🔄 **SSR Safe** - Works with server-side rendering
- 🚀 **Lightweight** - Minimal bundle size impact
- ⚙️ **Configurable** - Customizable idle timeout

## Use Cases

- **Auto-logout** - Automatically sign out idle users
- **Media Control** - Pause videos/audio when user is away
- **Analytics** - Track user engagement and session quality
- **Performance** - Reduce background operations when idle
- **Notifications** - Show idle warnings or session expiry alerts
- **Gaming** - Pause games when user switches tabs

## Browser Support

This hook relies on standard web APIs that are supported in all modern browsers:
- `document.hidden` and `visibilitychange` events
- `document.hasFocus()`
- Standard mouse, keyboard, and touch events

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.
