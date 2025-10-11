import { useState, useEffect, useRef } from "react";

/**
 * Configuration options for the useUserActivity hook.
 */
interface UseUserActivityOptions {
  /** Time (in ms) after which user is considered idle if no activity */
  idleTimeout?: number;
}

/**
 * Return value interface for the useUserActivity hook.
 */
interface UseUserActivityReturn {
  /** True when user is both visible and not idle */
  isActive: boolean;
  /** True when user has been inactive for longer than idleTimeout */
  isIdle: boolean;
  /** True when page is visible and window has focus */
  isVisible: boolean;
  /** Timestamp of the last user activity */
  lastActiveAt: number;
}

/**
 * A React hook that tracks user activity and idle state based on page visibility,
 * window focus, and user interactions (mouse, keyboard, touch).
 *
 * @param options - Configuration options for the hook
 * @param options.idleTimeout - Time in milliseconds after which user is considered idle (default: 60000ms)
 *
 * @returns An object containing user activity state information
 *
 * @example
 * ```tsx
 * import { useUserActivity } from '@mesilicon7/use-user-activity';
 *
 * function App() {
 *   const { isActive, isIdle, isVisible, lastActiveAt } = useUserActivity({
 *     idleTimeout: 30000 // 30 seconds
 *   });
 *
 *   return (
 *     <div>
 *       <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
 *       <p>User is {isIdle ? 'idle' : 'active'}</p>
 *       <p>Page is {isVisible ? 'visible' : 'hidden'}</p>
 *       <p>Last active: {new Date(lastActiveAt).toLocaleTimeString()}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Auto-pause video when user becomes idle
 * function VideoPlayer() {
 *   const { isActive } = useUserActivity({ idleTimeout: 10000 });
 *   const videoRef = useRef<HTMLVideoElement>(null);
 *
 *   useEffect(() => {
 *     if (!isActive && videoRef.current) {
 *       videoRef.current.pause();
 *     }
 *   }, [isActive]);
 *
 *   return <video ref={videoRef} />;
 * }
 * ```
 *
 * @remarks
 * This hook automatically:
 * - Tracks mouse movements, key presses, mouse clicks, and touch events
 * - Monitors page visibility changes and window focus/blur events
 * - Sets up and cleans up all event listeners automatically
 * - Works safely in SSR environments
 *
 * The hook considers a user "active" when they are both visible (page is visible and focused)
 * and not idle (has interacted within the idleTimeout period).
 */
export function useUserActivity(
  { idleTimeout = 60_000 }: UseUserActivityOptions = {} // default 60s
): UseUserActivityReturn {
  const [isVisible, setIsVisible] = useState(true);
  const [isIdle, setIsIdle] = useState(false);
  const [lastActiveAt, setLastActiveAt] = useState(Date.now());

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const markActivity = () => {
      setLastActiveAt(Date.now());
      setIsIdle(false);
      resetIdleTimer();
    };

    const resetIdleTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsIdle(true), idleTimeout);
    };

    const updateVisibility = () => {
      const visible = !document.hidden && document.hasFocus();
      setIsVisible(visible);
      if (visible) markActivity();
    };

    // Attach event listeners
    const activityEvents = ["mousemove", "keydown", "mousedown", "touchstart"];
    activityEvents.forEach((event) =>
      window.addEventListener(event, markActivity, { passive: true })
    );

    document.addEventListener("visibilitychange", updateVisibility);
    window.addEventListener("focus", updateVisibility);
    window.addEventListener("blur", updateVisibility);

    // Initialize
    updateVisibility();
    resetIdleTimer();

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, markActivity)
      );
      document.removeEventListener("visibilitychange", updateVisibility);
      window.removeEventListener("focus", updateVisibility);
      window.removeEventListener("blur", updateVisibility);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [idleTimeout]);

  return {
    isActive: isVisible && !isIdle,
    isIdle,
    isVisible,
    lastActiveAt,
  };
}
