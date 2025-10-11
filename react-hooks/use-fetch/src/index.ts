import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Extended fetch options with specific method types and simplified headers
 */
interface FetchOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
}

/**
 * Return type for the useFetch hook
 * @template T - The expected data type
 */
export interface UseFetchResult<T> {
  /** The fetched data, null if not yet loaded or error occurred */
  data: T | null;
  /** Error object if request failed, null otherwise */
  error: Error | null;
  /** Loading state - true when request is in progress */
  loading: boolean;
  /** Function to manually trigger the fetch request */
  execute: () => Promise<void>;
}

/**
 * Configuration options for the useFetch hook
 * @template T - The expected data type after transformation
 */
interface UseFetchConfig<T> {
  /** The URL to fetch from */
  url: string;
  /** Fetch options (method, headers, body, etc.) */
  options?: FetchOptions;
  /** Whether to fetch immediately when hook mounts (default: true) */
  immediate?: boolean;
  /** Function to transform the response data */
  transform?: (data: any) => T;
  /** Interval in milliseconds for automatic revalidation (default: 5000) */
  revalidateInterval?: number;
  /** If true, only fetch once and ignore revalidation (default: false) */
  once?: boolean;
}

/**
 * A powerful React hook for handling HTTP requests with built-in loading states,
 * error handling, automatic revalidation, and data transformation.
 *
 * @template T - The expected data type
 * @param config - Configuration object for the fetch request
 * @returns Object containing data, error, loading state, and execute function
 *
 * @example
 * ```typescript
 * // Basic GET request
 * const { data, loading, error } = useFetch<User>({
 *   url: '/api/user/123'
 * });
 *
 * // POST request with manual execution
 * const { execute, loading } = useFetch({
 *   url: '/api/users',
 *   options: {
 *     method: 'POST',
 *     body: { name: 'John' }
 *   },
 *   immediate: false
 * });
 *
 * // With data transformation and custom revalidation
 * const { data } = useFetch<ProcessedData>({
 *   url: '/api/raw-data',
 *   transform: (raw) => processData(raw),
 *   revalidateInterval: 10000
 * });
 * ```
 */
export function useFetch<T = any>({
  url,
  options = {},
  immediate = true,
  transform,
  revalidateInterval = 5000,
  once = false
}: UseFetchConfig<T>): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Track if we've already fetched (for 'once' option)
  const hasFetchedRef = useRef<boolean>(false);
  // Store options in ref to prevent unnecessary re-renders
  const optionsRef = useRef(options);

  // Keep the latest options in a ref to prevent execute from changing
  optionsRef.current = options;

  /**
   * Execute the fetch request
   * Handles different body types, response parsing, and error management
   */
  const execute = useCallback(async (): Promise<void> => {
    if (!url) return;

    // Skip if 'once' is true and we've already fetched
    if (once && hasFetchedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const { method = 'GET', headers = {}, body, credentials = 'same-origin', ...restOptions } =
        optionsRef.current;

      // Set default Content-Type for JSON requests
      const finalHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers
      };

      // Handle different body types
      let finalBody: string | FormData | undefined;
      if (body) {
        if (body instanceof FormData) {
          finalBody = body;
          // Remove Content-Type for FormData (browser sets it with boundary)
          delete finalHeaders['Content-Type'];
        } else if (typeof body === 'object') {
          finalBody = JSON.stringify(body);
        } else {
          finalBody = body;
        }
      }

      const response = await fetch(url, {
        method,
        headers: finalHeaders,
        body: finalBody,
        credentials,
        ...restOptions
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      // Parse response based on Content-Type
      let responseData: any;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else if (contentType?.includes('text/')) {
        responseData = await response.text();
      } else {
        responseData = await response.blob();
      }

      // Apply transformation if provided
      const finalData = transform ? transform(responseData) : responseData;

      setData(finalData);
      hasFetchedRef.current = true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [url, transform, once]); // options removed from deps to prevent unnecessary re-renders

  // Reset fetch status when URL changes
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [url]);

  // Execute immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  // Set up automatic revalidation interval
  useEffect(() => {
    if (!revalidateInterval || once) return;

    const interval = setInterval(() => {
      execute();
    }, revalidateInterval);

    return () => clearInterval(interval);
  }, [execute, revalidateInterval, once]);

  return {
    data,
    error,
    loading,
    execute
  };
}
