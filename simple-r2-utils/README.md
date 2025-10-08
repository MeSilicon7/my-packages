# simple-r2-utils

A lightweight TypeScript/JavaScript utility library for generating pre-signed URLs for Cloudflare R2 storage. This package provides simple functions to create secure upload and download URLs without exposing your credentials to the client-side.

[![npm version](https://badge.fury.io/js/@mesilicon7%2Fsimple-r2-utils.svg)](https://badge.fury.io/js/@mesilicon7%2Fsimple-r2-utils)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/license/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)



## Features

- 🔐 Generate pre-signed upload URLs for Cloudflare R2
- 📥 Generate pre-signed download URLs for Cloudflare R2
- 🛡️ AWS4 signature authentication
- 📦 Zero dependencies (uses Node.js built-in crypto)
- 🎯 TypeScript support with full type definitions
- ⚡ Lightweight and fast

## Installation

```bash
npm install @mesilicon7/simple-r2-utils
```

```bash
yarn add @mesilicon7/simple-r2-utils
```

```bash
pnpm add @mesilicon7/simple-r2-utils
```

## Prerequisites

Before using this library, you need:

1. A Cloudflare account with R2 storage enabled
2. An R2 bucket created
3. R2 API credentials (Access Key ID and Secret Access Key)

## Usage

### Import

```typescript
import { getPreSignedUploadUrl, getPreSignedDownloadUrl } from '@mesilicon7/simple-r2-utils';
```

### Generate Upload URL

```typescript
const uploadUrl = await getPreSignedUploadUrl(
  'images/profile.jpg',        // fileName
  'your-account-id',           // accountId
  'your-access-key-id',        // accessKeyId
  'your-secret-access-key',    // secretAccessKey
  'my-bucket',                 // bucketName
  3600,                        // expiresIn (seconds)
  'image/jpeg'                 // contentType
);

// Use the URL to upload a file
const response = await fetch(uploadUrl, {
  method: 'PUT',
  body: fileData,
  headers: {
    'Content-Type': 'image/jpeg'
  }
});
```

### Generate Download URL

```typescript
const downloadUrl = await getPreSignedDownloadUrl(
  'images/profile.jpg',        // fileName
  'your-account-id',           // accountId
  'your-access-key-id',        // accessKeyId
  'your-secret-access-key',    // secretAccessKey
  'my-bucket',                 // bucketName
  3600                         // expiresIn (seconds)
);

// Use the URL to download a file
const response = await fetch(downloadUrl);
const fileData = await response.blob();
```

## API Reference

### `getPreSignedUploadUrl(fileName, accountId, accessKeyId, secretAccessKey, bucketName, expiresIn, contentType)`

Generates a pre-signed URL for uploading files to Cloudflare R2.

**Parameters:**
- `fileName` (string): Name of the file to upload, including path if nested (e.g., 'folder/file.jpg')
- `accountId` (string): Your Cloudflare account ID
- `accessKeyId` (string): R2 access key ID
- `secretAccessKey` (string): R2 secret access key
- `bucketName` (string): Name of the R2 bucket
- `expiresIn` (number): URL expiration time in seconds
- `contentType` (string): MIME type of the file to upload

**Returns:** `Promise<string>` - The pre-signed upload URL

### `getPreSignedDownloadUrl(fileName, accountId, accessKeyId, secretAccessKey, bucketName, expiresIn)`

Generates a pre-signed URL for downloading files from Cloudflare R2.

**Parameters:**
- `fileName` (string): Name of the file to download, including path if nested
- `accountId` (string): Your Cloudflare account ID
- `accessKeyId` (string): R2 access key ID
- `secretAccessKey` (string): R2 secret access key
- `bucketName` (string): Name of the R2 bucket
- `expiresIn` (number): URL expiration time in seconds

**Returns:** `Promise<string>` - The pre-signed download URL

## Examples

### Basic Upload Example

```typescript
import { getPreSignedUploadUrl } from '@mesilicon7/simple-r2-utils';

const accountId = "your-account-id";
const accessKeyId = "your-access-key-id";
const secretAccessKey = "your-secret-access-key";
const bucketName = "my-bucket";
const fileName = "example.txt";
const expiresIn = 3600; // 1 hour

// Generate pre-signed upload URL
const uploadUrl = await getPreSignedUploadUrl(
  fileName,
  accountId,
  accessKeyId,
  secretAccessKey,
  bucketName,
  expiresIn,
  "text/plain"
);

// Prepare content and upload
const content = "Hello, R2!";
const blob = new Blob([content], { type: "text/plain" });

console.log("Generated upload URL:", uploadUrl);

const response = await fetch(uploadUrl, {
  method: "PUT",
  body: blob,
  headers: { "Content-Type": "text/plain" }
});

if (response.ok) {
  console.log("✅ File uploaded successfully!");
} else {
  console.error("❌ Upload failed:", response.status, response.statusText);
}
```

### Basic Download Example

```typescript
import { getPreSignedDownloadUrl } from '@mesilicon7/simple-r2-utils';

const accountId = "your-account-id";
const accessKeyId = "your-access-key-id";
const secretAccessKey = "your-secret-access-key";
const bucketName = "my-bucket";
const fileName = "example.txt";
const expiresIn = 3600; // 1 hour

// Generate pre-signed download URL
const downloadUrl = await getPreSignedDownloadUrl(
  fileName,
  accountId,
  accessKeyId,
  secretAccessKey,
  bucketName,
  expiresIn
);

console.log("Generated download URL:", downloadUrl);

// Download the file
const response = await fetch(downloadUrl);
if (response.ok) {
  const fileContent = await response.text();
  console.log("File content:", fileContent);
} else {
  console.error("❌ Download failed:", response.status, response.statusText);
}
```

### Frontend Upload Example

```typescript
// Get upload URL from your backend
const response = await fetch('/upload-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileName: 'my-file.jpg',
    contentType: 'image/jpeg'
  })
});

const { uploadUrl } = await response.json();

// Upload file directly to R2
const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
const file = fileInput.files![0];

await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': file.type
  }
});
```

## Environment Variables

For security, store your credentials as environment variables:

```bash
CLOUDFLARE_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=your-bucket-name
```


## Security Considerations

- Never expose your R2 credentials on the client-side
- Always validate file types and sizes on your backend
- Consider implementing rate limiting for URL generation endpoints
- Use appropriate expiration times for your use case
- Validate user permissions before generating URLs

## Requirements

- Node.js 14+ (uses built-in crypto module)
- TypeScript 4+ (for TypeScript projects)

## License

This project is licensed under the MIT License.


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.


---

Made with ❤️ by [Mesilicon7](https://github.com/mesilicon7)
