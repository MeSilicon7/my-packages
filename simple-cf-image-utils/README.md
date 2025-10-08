# Simple Cloudflare Images Utils

A lightweight TypeScript library for working with Cloudflare Images API. Provides utilities for generating direct upload URLs and signed image URLs.

[![npm version](https://badge.fury.io/js/@mesilicon7%2Fsimple-cf-image-utils.svg)](https://badge.fury.io/js/@mesilicon7%2Fsimple-cf-image-utils)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/license/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)



## Features

- 🚀 Generate direct upload URLs for client-side image uploads
- 🔐 Create signed URLs for secure image delivery
- 📦 TypeScript support with full type definitions
- 🌐 Works in both Node.js and browser environments
- ⚡ Zero dependencies (uses native Web APIs)

## Installation

```bash
npm install @mesilicon7/simple-cf-image-utils
```

## Setup

Before using this library, you'll need:

1. A Cloudflare account with Images enabled
2. Your Cloudflare Account ID
3. A Cloudflare API token with Images permissions
4. Your Images delivery account hash
5. A signing key (for signed URLs)

## Usage

### Direct Upload URLs

Generate a secure upload URL that allows direct uploads to Cloudflare Images without routing through your server:

```typescript
import { makeCfImageURL } from '@mesilicon7/simple-cf-image-utils';

const uploadData = await makeCfImageURL(
  'your-account-id',
  'your-api-token',
  { alt: 'Profile picture', userId: '123' }, // Optional metadata
  false // requireSignedURLs
);

// Use uploadData.result.uploadURL for direct uploads
// uploadData.result.id contains the image ID
```

### Signed Image URLs

Create time-limited, cryptographically signed URLs for secure image access:

```typescript
import { getSignedImageUrlUsingID } from '@mesilicon7/simple-cf-image-utils';

const signedUrl = await getSignedImageUrlUsingID(
  'Vi7wi5KSItxGFsWRG2Us6Q',     // Account hash
  '2cdc28f0-017a-49c4-9ed7',    // Image ID
  'public',                      // Variant name
  'your-signing-key',           // Signing key
  3600                          // Expires in 1 hour
);

// Use signedUrl in your HTML: <img src={signedUrl} />
```

## API Reference

### `makeCfImageURL(account_id, api_token, metadata?, requireSignedURLs?)`

Creates a direct upload URL for Cloudflare Images.

**Parameters:**
- `account_id` (string): Your Cloudflare account ID
- `api_token` (string): API token with Images:Edit permissions
- `metadata` (object, optional): Metadata to attach to the image
- `requireSignedURLs` (boolean, optional): Whether to require signed URLs (default: false)

**Returns:** Promise resolving to Cloudflare API response

### `getSignedImageUrlUsingID(accountHash, imageId, variant, signingKey, expiresInSeconds?)`

Generates a signed URL for secure image delivery.

**Parameters:**
- `accountHash` (string): Images delivery account hash
- `imageId` (string): Unique image identifier
- `variant` (string): Image variant/transformation name
- `signingKey` (string): Your Cloudflare Images signing key
- `expiresInSeconds` (number, optional): URL validity period (default: 3600)

**Returns:** Promise resolving to signed URL string

## Examples

### Complete Upload Flow

```typescript
import { makeCfImageURL } from '@mesilicon7/simple-cf-image-utils';

// 1. Generate upload URL
const uploadData = await makeCfImageURL(
  process.env.CF_ACCOUNT_ID,
  process.env.CF_API_TOKEN,
  { category: 'avatars', userId: user.id }
);

// 2. Upload file using the returned URL and form data
const formData = new FormData();
Object.entries(uploadData.result.form).forEach(([key, value]) => {
  formData.append(key, value);
});
formData.append('file', imageFile);

const uploadResponse = await fetch(uploadData.result.uploadURL, {
  method: 'POST',
  body: formData
});

console.log('Image uploaded with ID:', uploadData.result.id);
```

### Different Expiration Times

```typescript
import { getSignedImageUrlUsingID } from '@mesilicon7/simple-cf-image-utils';

// Short-lived URL (5 minutes)
const tempUrl = await getSignedImageUrlUsingID(
  accountHash, imageId, 'thumbnail', signingKey, 300
);

// Long-lived URL (24 hours)
const dayUrl = await getSignedImageUrlUsingID(
  accountHash, imageId, 'public', signingKey, 86400
);
```

## Environment Variables

For security, store your credentials as environment variables:

```bash
CF_ACCOUNT_ID=your-account-id
CF_API_TOKEN=your-api-token
CF_ACCOUNT_HASH=your-account-hash
CF_SIGNING_KEY=your-signing-key
```

## Error Handling

Both functions throw errors that should be handled:

```typescript
try {
  const uploadData = await makeCfImageURL(accountId, apiToken);
  // Handle success
} catch (error) {
  console.error('Upload URL generation failed:', error.message);
  // Handle error
}
```

## Requirements

- Node.js 18+ or modern browser with Web Crypto API support
- Cloudflare Images subscription
- Valid Cloudflare API credentials

## Contributing

Contributions are welcome! Please open issues or pull requests for bug fixes, features, or improvements.


## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.