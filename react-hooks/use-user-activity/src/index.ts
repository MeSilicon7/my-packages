import { useState, useEffect, useRef } from "react";

interface UseUserActivityOptions {
  /** Time (in ms) after which user is considered idle if no activity */
  idleTimeout?: number;
}

interface UseUserActivityReturn {
  isActive: boolean;
  isIdle: boolean;
  isVisible: boolean;
  lastActiveAt: number;
}

/**
 * Tracks whether the user is active or idle based on:
 * - Page visibility
 * - Window focus
 * - User interactions (mouse, keyboard, touch)
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
