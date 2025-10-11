# @mesilicon7/use-file-upload-progress

A React hook for uploading files with real-time progress tracking and cancellation support.

## Installation

```bash
npm install @mesilicon7/use-file-upload-progress
```

```bash
yarn add @mesilicon7/use-file-upload-progress
```

```bash
pnpm add @mesilicon7/use-file-upload-progress
```

## Usage

```tsx
import React from 'react';
import { useFileUploadProgress } from '@mesilicon7/use-file-upload-progress';

function FileUploader() {
  const { uploadFile, progress, isUploading, error, abort } = useFileUploadProgress();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const response = await uploadFile(file, '/api/upload', {
        method: 'POST',
        useFormData: true,
        onProgress: (progress) => console.log(`Upload: ${progress}%`)
      });
      
      if (response) {
        console.log('Upload successful!', response);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={handleFileSelect} 
        disabled={isUploading} 
      />
      
      {isUploading && (
        <div>
          <progress value={progress} max={100} />
          <span>{progress}%</span>
          <button onClick={abort}>Cancel Upload</button>
        </div>
      )}
      
      {error && (
        <div style={{ color: 'red' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
}
```

## API

### `useFileUploadProgress()`

**Returns:** Object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `progress` | `number` | Current upload progress as percentage (0-100) |
| `isUploading` | `boolean` | Whether an upload is currently in progress |
| `error` | `string \| null` | Error message if upload failed, null otherwise |
| `uploadFile` | `function` | Function to start uploading a file |
| `abort` | `function` | Function to abort the current upload |

### `uploadFile(file, url, options?)`

**Parameters:**
- `file` (File): The file to upload
- `url` (string): The upload endpoint URL
- `options` (optional): Upload configuration object

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `method` | `"PUT" \| "POST"` | `"PUT"` | HTTP method for the request |
| `headers` | `Record<string, string>` | `{}` | Additional headers to include |
| `onProgress` | `(progress: number) => void` | `undefined` | Progress callback function |
| `useFormData` | `boolean` | `false` | Whether to wrap file in FormData |

**Returns:** `Promise<Response | null>`
- Returns a Response object on success
- Returns `null` on failure or cancellation

## Examples

### Basic File Upload

```tsx
function BasicUploader() {
  const { uploadFile, progress, isUploading } = useFileUploadProgress();

  const handleUpload = async (file: File) => {
    const response = await uploadFile(file, '/api/files');
    if (response?.ok) {
      console.log('Upload complete!');
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} 
      />
      {isUploading && <div>Progress: {progress}%</div>}
    </div>
  );
}
```

### Image Upload with Preview

```tsx
function ImageUploader() {
  const { uploadFile, progress, isUploading, error } = useFileUploadProgress();
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    // Create preview
    setPreview(URL.createObjectURL(file));

    // Upload with custom headers
    const response = await uploadFile(file, '/api/images', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer your-token',
        'x-upload-source': 'web-app'
      },
      useFormData: true,
      onProgress: (progress) => {
        console.log(`Uploading image: ${progress}%`);
      }
    });

    if (response?.ok) {
      const result = await response.json();
      console.log('Image uploaded:', result.imageUrl);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
      />
      
      {preview && <img src={preview} alt="Preview" style={{ maxWidth: 200 }} />}
      
      {isUploading && (
        <div>
          <div>Uploading... {progress}%</div>
          <progress value={progress} max={100} />
        </div>
      )}
      
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### Multiple File Upload with Queue

```tsx
function MultiFileUploader() {
  const { uploadFile, progress, isUploading, abort } = useFileUploadProgress();
  const [queue, setQueue] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const uploadQueue = async (files: File[]) => {
    setQueue(files);
    
    for (let i = 0; i < files.length; i++) {
      setCurrentIndex(i);
      
      const response = await uploadFile(files[i], '/api/upload', {
        method: 'POST',
        useFormData: true,
        onProgress: (progress) => {
          console.log(`File ${i + 1}/${files.length}: ${progress}%`);
        }
      });
      
      if (!response) break; // Stop on error or cancellation
    }
    
    setQueue([]);
    setCurrentIndex(0);
  };

  return (
    <div>
      <input 
        type="file" 
        multiple
        onChange={(e) => e.target.files && uploadQueue(Array.from(e.target.files))}
      />
      
      {isUploading && (
        <div>
          <div>Uploading file {currentIndex + 1} of {queue.length}</div>
          <div>{queue[currentIndex]?.name}</div>
          <progress value={progress} max={100} />
          <button onClick={abort}>Cancel</button>
        </div>
      )}
    </div>
  );
}
```

### Raw File Upload (No FormData)

```tsx
function RawFileUploader() {
  const { uploadFile, progress, isUploading } = useFileUploadProgress();

  const handleRawUpload = async (file: File) => {
    // Upload file directly without FormData wrapper
    const response = await uploadFile(file, '/api/raw-upload', {
      method: 'PUT',
      useFormData: false, // Send raw file data
      headers: {
        'Content-Type': file.type, // Explicitly set if needed
        'x-file-name': file.name,
        'x-file-size': file.size.toString()
      }
    });

    if (response?.ok) {
      console.log('Raw file uploaded successfully');
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => e.target.files?.[0] && handleRawUpload(e.target.files[0])} 
      />
      {isUploading && <div>Uploading: {progress}%</div>}
    </div>
  );
}
```

## Features

- 🚀 **Real-time Progress** - Track upload progress with XMLHttpRequest
- ⏹️ **Cancellation Support** - Abort uploads at any time
- 📦 **Flexible Format** - Send as FormData or raw file data
- 🔧 **Configurable** - Custom headers, methods, and callbacks
- 💪 **TypeScript** - Full TypeScript support with detailed types
- 🧹 **Auto Cleanup** - Handles event listeners and controllers
- 📱 **Universal** - Works with any file upload API
- ⚡ **Lightweight** - Minimal dependencies and bundle size

## Upload Formats

### FormData Upload (`useFormData: true`)
```typescript
// Creates: FormData with file appended as "file" field
const formData = new FormData();
formData.append("file", file);
```

### Raw File Upload (`useFormData: false`)
```typescript
// Sends the file directly as request body
// Automatically sets Content-Type header based on file.type
```

## Error Handling

The hook provides comprehensive error handling:

- **Network errors** - Connection issues, server errors
- **HTTP errors** - 4xx, 5xx status codes
- **Cancellation** - User aborted uploads
- **Validation errors** - Invalid file types, size limits (server-side)

```tsx
const { uploadFile, error } = useFileUploadProgress();

// Error examples:
// "Upload failed: 413" (file too large)
// "Upload failed" (network error)
// "Upload aborted" (user cancelled)
```

## Browser Support

Uses standard web APIs supported in all modern browsers:
- XMLHttpRequest with upload progress events
- AbortController for cancellation
- File API and FormData

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.
