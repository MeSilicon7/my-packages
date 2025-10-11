import { useState, useEffect, useCallback } from 'react';

interface FetchOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
}

interface UseFetchResult<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  execute: () => void;
}

interface UseFetchConfig<T> {
  url: string;
  options?: FetchOptions;
  immediate?: boolean;
  transform?: (data: any) => T;
}

export function useFetch<T = any>({
  url,
  options = {},
  immediate = true,
  transform
}: UseFetchConfig<T>): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const execute = useCallback(async () => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const {
        method = 'GET',
        headers = {},
        body,
        credentials = 'same-origin',
        ...restOptions
      } = options;

      // Prepare headers
      const finalHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers
      };

      // Prepare body
      let finalBody: string | FormData | undefined;
      if (body) {
        if (body instanceof FormData) {
          finalBody = body;
          // Remove Content-Type header for FormData (browser will set it with boundary)
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

      // Handle different response types
      let responseData: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      } else if (contentType?.includes('text/')) {
        responseData = await response.text();
      } else {
        responseData = await response.blob();
      }

      // Apply transform if provided
      const finalData = transform ? transform(responseData) : responseData;
      
      setData(finalData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [url, options, transform]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    error,
    loading,
    execute
  };
}

// Convenience hooks for specific methods
export function useGet<T = any>(
  url: string, 
  options?: Omit<FetchOptions, 'method'>,
  config?: Omit<UseFetchConfig<T>, 'url' | 'options'>
) {
  return useFetch<T>({
    url,
    options: { ...options, method: 'GET' },
    ...config
  });
}

export function usePost<T = any>(
  url: string,
  body?: any,
  options?: Omit<FetchOptions, 'method' | 'body'>,
  config?: Omit<UseFetchConfig<T>, 'url' | 'options'>
) {
  return useFetch<T>({
    url,
    options: { ...options, method: 'POST', body },
    immediate: false, // POST requests typically shouldn't be immediate
    ...config
  });
}

export function usePut<T = any>(
  url: string,
  body?: any,
  options?: Omit<FetchOptions, 'method' | 'body'>,
  config?: Omit<UseFetchConfig<T>, 'url' | 'options'>
) {
  return useFetch<T>({
    url,
    options: { ...options, method: 'PUT', body },
    immediate: false,
    ...config
  });
}

export function useDelete<T = any>(
  url: string,
  options?: Omit<FetchOptions, 'method'>,
  config?: Omit<UseFetchConfig<T>, 'url' | 'options'>
) {
  return useFetch<T>({
    url,
    options: { ...options, method: 'DELETE' },
    immediate: false,
    ...config
  });
}