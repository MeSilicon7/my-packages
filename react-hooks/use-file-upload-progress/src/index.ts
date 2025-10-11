import { useState, useRef, useCallback } from "react";

/**
 * Configuration options for file upload.
 */
interface UploadOptions {
  /** HTTP method to use for the upload. Default: "PUT" */
  method?: "PUT" | "POST";
  /** Additional headers to include with the request */
  headers?: Record<string, string>;
  /** Callback function called with progress percentage (0-100) */
  onProgress?: (progress: number) => void;
  /** Whether to wrap the file in FormData. Default: false (sends raw file) */
  useFormData?: boolean;
}

/**
 * Return value interface for the useFileUploadProgress hook.
 */
interface UseFileUploadProgressReturn {
  /** Current upload progress as a percentage (0-100) */
  progress: number;
  /** Whether an upload is currently in progress */
  isUploading: boolean;
  /** Error message if upload failed, null otherwise */
  error: string | null;
  /** Function to start uploading a file */
  uploadFile: (file: File, url: string, options?: UploadOptions) => Promise<Response | null>;
  /** Function to abort the current upload */
  abort: () => void;
}

/**
 * A React hook for uploading files with real-time progress tracking and cancellation support.
 * Uses XMLHttpRequest for progress tracking capabilities not available with fetch().
 *
 * @returns An object containing upload state and control functions
 *
 * @example
 * ```tsx
 * import { useFileUploadProgress } from '@mesilicon7/use-file-upload-progress';
 *
 * function FileUploader() {
 *   const { uploadFile, progress, isUploading, error, abort } = useFileUploadProgress();
 *
 *   const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
 *     const file = event.target.files?.[0];
 *     if (!file) return;
 *
 *     try {
 *       const response = await uploadFile(file, '/api/upload', {
 *         method: 'POST',
 *         useFormData: true,
 *         onProgress: (progress) => console.log(`Upload: ${progress}%`)
 *       });
 *       
 *       if (response) {
 *         console.log('Upload successful!');
 *       }
 *     } catch (err) {
 *       console.error('Upload failed:', err);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <input type="file" onChange={handleFileSelect} disabled={isUploading} />
 *       {isUploading && (
 *         <div>
 *           <progress value={progress} max={100} />
 *           <span>{progress}%</span>
 *           <button onClick={abort}>Cancel</button>
 *         </div>
 *       )}
 *       {error && <div style={{color: 'red'}}>{error}</div>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Upload with custom headers and raw file data
 * function ImageUploader() {
 *   const { uploadFile, progress, isUploading } = useFileUploadProgress();
 *
 *   const uploadImage = async (file: File) => {
 *     const response = await uploadFile(file, '/api/images', {
 *       method: 'PUT',
 *       headers: {
 *         'Authorization': 'Bearer token123',
 *         'x-custom-header': 'value'
 *       },
 *       useFormData: false, // Send raw file data
 *       onProgress: (progress) => {
 *         console.log(`Uploading: ${progress}%`);
 *       }
 *     });
 *     
 *     return response;
 *   };
 *
 *   return (
 *     <div>
 *       {isUploading && <div>Progress: {progress}%</div>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @remarks
 * This hook provides several key features:
 * - **Progress Tracking**: Real-time upload progress using XMLHttpRequest
 * - **Cancellation**: Ability to abort uploads using AbortController
 * - **Flexible Format**: Send files as FormData or raw file data
 * - **Auto Content-Type**: Automatically sets Content-Type header when sending raw files
 * - **Error Handling**: Comprehensive error states and messages
 * - **TypeScript Support**: Full type safety with detailed interfaces
 * 
 * The hook automatically handles:
 * - Setting up XMLHttpRequest with progress tracking
 * - Managing upload state (progress, loading, errors)
 * - Cleaning up event listeners and abort controllers
 * - Creating Response-like objects for consistency with fetch API
 * 
 * Choose between `useFormData: true` for traditional form uploads or `useFormData: false` 
 * for direct file uploads (useful for APIs expecting raw file data).
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
