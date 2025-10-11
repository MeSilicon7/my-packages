import { useState, useRef, useCallback } from "react";

interface UploadOptions {
  method?: "PUT" | "POST";
  headers?: Record<string, string>;
  onProgress?: (progress: number) => void;
  useFormData?: boolean; // Add option to control upload format
}

interface UseFileUploadProgressReturn {
  progress: number;
  isUploading: boolean;
  error: string | null;
  uploadFile: (file: File, url: string, options?: UploadOptions) => Promise<Response | null>;
  abort: () => void;
}

/**
 * React hook for uploading a file with progress tracking and cancellation.
 *
 * @example
 * const { uploadFile, progress, abort, isUploading } = useFileUploadProgress();
 *
 * async function handleUpload(file: File) {
 *   const response = await uploadFile(file, "/api/upload");
 *   console.log("Upload complete:", response);
 * }
 */
export function useFileUploadProgress(): UseFileUploadProgressReturn {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const uploadFile = useCallback(
    async (file: File, url: string, options: UploadOptions = {}) => {
      const { method = "PUT", headers = {}, onProgress, useFormData = false } = options;
      setProgress(0);
      setError(null);
      setIsUploading(true);

      const controller = new AbortController();
      controllerRef.current = controller;

      return new Promise<Response | null>((resolve) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setProgress(percentComplete);
            onProgress?.(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100);
            onProgress?.(100);
            // Create a Response-like object
            const response = new Response(xhr.responseText, {
              status: xhr.status,
              statusText: xhr.statusText,
              headers: new Headers(xhr.getAllResponseHeaders().split('\r\n').reduce((headers, line) => {
                const [key, value] = line.split(': ');
                if (key && value) headers[key] = value;
                return headers;
              }, {} as Record<string, string>))
            });
            resolve(response);
          } else {
            setError(`Upload failed: ${xhr.status}`);
            resolve(null);
          }
          setIsUploading(false);
          controllerRef.current = null;
        });

        xhr.addEventListener('error', () => {
          setError("Upload failed");
          setIsUploading(false);
          controllerRef.current = null;
          resolve(null);
        });

        xhr.addEventListener('abort', () => {
          setError("Upload aborted");
          setIsUploading(false);
          controllerRef.current = null;
          resolve(null);
        });

        // Handle abort signal
        controller.signal.addEventListener('abort', () => {
          xhr.abort();
        });

        xhr.open(method, url);

        // Auto-detect Content-Type from file if not using FormData and not explicitly set
        const finalHeaders = { ...headers };
        if (!useFormData && file.type) {
          // Check if Content-Type is already provided (case-insensitive)
          const hasContentType = Object.keys(finalHeaders).some(key => 
            key.toLowerCase() === 'content-type'
          );
          
          if (!hasContentType) {
            finalHeaders['Content-Type'] = file.type;
          }
        }

        // Set headers
        Object.entries(finalHeaders).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        // Send either FormData or raw file based on option
        if (useFormData) {
          const formData = new FormData();
          formData.append("file", file);
          xhr.send(formData);
        } else {
          xhr.send(file);
        }
      });
    },
    []
  );

  const abort = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      setIsUploading(false);
      setError("Upload aborted");
    }
  }, []);

  return { progress, isUploading, error, uploadFile, abort };
}
