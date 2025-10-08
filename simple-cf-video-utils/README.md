# @mesilicon7/simple-cf-video-utils

> A lightweight TypeScript library for working with Cloudflare Stream videos, including upload URLs, restricted videos, signed tokens, and iframe generation.

[![npm version](https://badge.fury.io/js/@mesilicon7%2Fsimple-cf-video-utils.svg?icon=si%3Anpm)](https://badge.fury.io/js/@mesilicon7%2Fsimple-cf-video-utils)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/license/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)


## Features

- Generate direct upload URLs for public and restricted Cloudflare Stream videos
- Create signed tokens for accessing restricted videos with customizable restrictions
- Generate complete iframe embed codes with signed tokens for secure video playback
- Written in TypeScript with full type definitions for better developer experience


## Installation

```bash
npm install @mesilicon7/simple-cf-video-utils
```

```bash
yarn add @mesilicon7/simple-cf-video-utils
```

```bash
pnpm add @mesilicon7/simple-cf-video-utils
```

## Quick Start

```typescript
import { 
  makeVideoUploadUrl, 
  makeRestrictedVideoUploadUrl,
  getRestrictedVideoToken,
  getRestrictedVideoIframeUrl 
} from '@mesilicon7/simple-cf-video-utils';

// Get upload URL for public video
const uploadUrl = await makeVideoUploadUrl(
  'your-account-id',
  'your-api-token'
);

// Get upload URL for restricted video
const restrictedUploadUrl = await makeRestrictedVideoUploadUrl(
  'your-account-id', 
  'your-api-token'
);

// Generate signed token for restricted video
const token = await getRestrictedVideoToken(
  'your-account-id',
  'your-api-token',
  'video-uid'
);

// Generate complete iframe with restrictions
const iframe = await getRestrictedVideoIframeUrl(
  'your-account-id',
  'your-api-token', 
  'video-uid',
  {
    customer_domain: 'customer-abc123.cloudflarestream.com',
    width: 800,
    height: 450,
    autoplay: true,
    muted: true
  }
);
```

## API Reference

### `makeVideoUploadUrl(account_id, api_token, maxDurationSeconds?)`

Creates a direct upload URL for public Cloudflare Stream videos.

**Parameters:**
- `account_id` (string) - Your Cloudflare account ID
- `api_token` (string) - Your Cloudflare API token with Stream permissions
- `maxDurationSeconds` (number, optional) - Maximum video duration in seconds (default: 3600)

**Returns:** Promise resolving to the upload URL response from Cloudflare

### `makeRestrictedVideoUploadUrl(account_id, api_token, maxDurationSeconds?)`

Creates a direct upload URL for restricted videos that require signed URLs for access.

**Parameters:**
- Same as `makeVideoUploadUrl`

**Returns:** Promise resolving to the upload URL response (video will require signed tokens)

### `getRestrictedVideoToken(account_id, api_token, video_uid, restrictions?)`

Generates a signed token for accessing restricted videos.

**Parameters:**
- `account_id` (string) - Your Cloudflare account ID
- `api_token` (string) - Your Cloudflare API token
- `video_uid` (string) - The unique ID of the restricted video
- `restrictions` (SignedUrlRestrictions, optional) - Access restrictions

**SignedUrlRestrictions Interface:**
```typescript
interface SignedUrlRestrictions {
  exp?: number;           // Unix timestamp for expiration
  nbf?: number;           // Unix timestamp for "not before"
  downloadable?: boolean; // Allow MP4 downloads
  accessRules?: Array<{
    type: "any" | "ip.src" | "ip.geoip.country";
    action: "allow" | "block";
    country?: string[];   // ISO country codes
    ip?: string[];        // IP ranges/CIDRs
  }>;
}
```

### `getRestrictedVideoIframeUrl(account_id, api_token, video_uid, config, restrictions?)`

Generates a complete iframe URL with signed token for restricted videos.

**Parameters:**
- `account_id`, `api_token`, `video_uid` - Same as above
- `config` (IframeConfig) - Iframe configuration
- `restrictions` (SignedUrlRestrictions, optional) - Access restrictions

**IframeConfig Interface:**
```typescript
interface IframeConfig {
  customer_domain: string;    // Your CF Stream domain
  width?: number;             // Iframe width (default: 1280)
  height?: number;            // Iframe height (default: 720)
  allowFullscreen?: boolean;  // Allow fullscreen (default: true)
  autoplay?: boolean;         // Auto-start playback
  muted?: boolean;            // Start muted
  controls?: boolean;         // Show controls
  loop?: boolean;             // Loop playback
  preload?: boolean;          // Preload metadata
  primaryColor?: string;      // Player UI color
  letterboxColor?: string;    // Letterbox color
  defaultTextTrack?: string;  // Default captions language
}
```

## Examples

### Basic Video Upload

```typescript
import { makeVideoUploadUrl } from '@mesilicon7/simple-cf-video-utils';

const uploadResponse = await makeVideoUploadUrl(
  process.env.CF_ACCOUNT_ID!,
  process.env.CF_API_TOKEN!,
  7200 // 2 hours max duration
);

console.log('Upload URL:', uploadResponse.result.uploadURL);
console.log('Video UID:', uploadResponse.result.uid);
```

### Restricted Video with Geographic Limits

```typescript
import { 
  makeRestrictedVideoUploadUrl,
  getRestrictedVideoToken 
} from '@mesilicon7/simple-cf-video-utils';

// Upload restricted video
const restrictedUpload = await makeRestrictedVideoUploadUrl(
  process.env.CF_ACCOUNT_ID!,
  process.env.CF_API_TOKEN!
);

// Later, generate token with geo restrictions
const token = await getRestrictedVideoToken(
  process.env.CF_ACCOUNT_ID!,
  process.env.CF_API_TOKEN!,
  'video-uid',
  {
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    accessRules: [
      {
        type: "ip.geoip.country",
        action: "allow", 
        country: ["US", "CA", "GB"]
      },
      {
        type: "any",
        action: "block"
      }
    ]
  }
);
```

### Complete Iframe Generation

```typescript
import { getRestrictedVideoIframeUrl } from '@mesilicon7/simple-cf-video-utils';

const iframeData = await getRestrictedVideoIframeUrl(
  process.env.CF_ACCOUNT_ID!,
  process.env.CF_API_TOKEN!,
  'your-video-uid',
  {
    customer_domain: 'customer-abc123.cloudflarestream.com',
    width: 800,
    height: 450,
    autoplay: true,
    muted: true,
    controls: true,
    primaryColor: '#ff6600',
    letterboxColor: 'transparent'
  },
  {
    exp: Math.floor(Date.now() / 1000) + 6 * 60 * 60, // 6 hours
    downloadable: false,
    accessRules: [
      { type: "ip.geoip.country", action: "allow", country: ["US", "GB"] }
    ]
  }
);

// Use in your HTML
const embedCode = `
<iframe
  src="${iframeData.iframe.src}"
  width="${iframeData.iframe.width}"
  height="${iframeData.iframe.height}"
  style="${iframeData.iframe.style}"
  allow="${iframeData.iframe.allow}"
  allowfullscreen="${iframeData.iframe.allowFullscreen}"
></iframe>`;
```

### IP-Based Access Control

```typescript
const token = await getRestrictedVideoToken(
  account_id,
  api_token,
  video_uid,
  {
    exp: Math.floor(Date.now() / 1000) + 2 * 60 * 60, // 2 hours
    accessRules: [
      {
        type: "ip.src",
        action: "allow",
        ip: ["192.168.1.0/24", "10.0.0.0/8"]
      },
      {
        type: "any", 
        action: "block"
      }
    ]
  }
);
```

## Environment Setup

Create a `.env` file in your project:

```bash
CF_ACCOUNT_ID=your-cloudflare-account-id
CF_API_TOKEN=your-cloudflare-api-token
```

## Requirements

- **Node.js** 16+ 
- **Cloudflare Stream** subscription
- **API Token** with Stream permissions

## Getting Your Credentials

1. **Account ID**: Found in your Cloudflare dashboard sidebar
2. **API Token**: Create at [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Use "Custom token" template
   - Add permissions: `Zone:Stream:Edit` and `Account:Stream:Edit`

## Error Handling

All functions throw descriptive errors that you should handle:

```typescript
try {
  const uploadUrl = await makeVideoUploadUrl(account_id, api_token);
  // Handle success
} catch (error) {
  console.error('Upload URL generation failed:', error.message);
  // Handle error appropriately
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

[@mesilicon7](https://github.com/mesilicon7/my-packages/simple-cf-video-utils)

## Links

- [Cloudflare Stream Documentation](https://developers.cloudflare.com/stream/)
- [Cloudflare Stream API](https://api.cloudflare.com/#stream)
- [NPM Package](https://www.npmjs.com/package/@mesilicon7/simple-cf-video-utils)