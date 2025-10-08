/**
 * Simple Cloudflare Stream Video Utils
 * 
 * A lightweight TypeScript library for working with Cloudflare Stream videos,
 * including upload URLs, restricted videos, signed tokens, and iframe generation.
 * 
 * @author @mesilicon7
 * 
 */

/**
 * Creates a direct upload URL for Cloudflare Stream videos.
 * 
 * @param account_id - Your Cloudflare account ID
 * @param api_token - Your Cloudflare API token with Stream permissions
 * @param maxDurationSeconds - Maximum video duration in seconds (default: 3600)
 * @returns Promise resolving to the upload URL response from Cloudflare
 * 
 * @example
 * ```typescript
 * const uploadUrl = await makeVideoUploadUrl(
 *   "your-account-id",
 *   "your-api-token",
 *   7200 // 2 hours max
 * );
 * console.log(uploadUrl.result.uploadURL);
 * ```
 */
export async function makeVideoUploadUrl(
  account_id: string,
  api_token: string,
  maxDurationSeconds = 3600,
) {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account_id}/stream/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${api_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxDurationSeconds,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get CF video URL: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting Cloudflare video URL:", error);
    throw error;
  }
}

/**
 * Creates a direct upload URL for restricted Cloudflare Stream videos.
 * Videos uploaded with this function will require signed URLs for access.
 * 
 * @param account_id - Your Cloudflare account ID
 * @param api_token - Your Cloudflare API token with Stream permissions
 * @param maxDurationSeconds - Maximum video duration in seconds (default: 3600)
 * @returns Promise resolving to the upload URL response from Cloudflare
 * 
 * @example
 * ```typescript
 * const restrictedUploadUrl = await makeRestrictedVideoUploadUrl(
 *   "your-account-id",
 *   "your-api-token",
 *   3600
 * );
 * // This video will require signed tokens for viewing
 * ```
 */
export async function makeRestrictedVideoUploadUrl(
  account_id: string,
  api_token: string,
  maxDurationSeconds = 3600,
) {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account_id}/stream/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${api_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxDurationSeconds,
          requireSignedURLs: true,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get CF restricted video URL: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting Cloudflare restricted video URL:", error);
    throw error;
  }
}

/**
 * Configuration options for signed URL restrictions.
 * Used to control access to restricted videos.
 */
export interface SignedUrlRestrictions {
  /** Unix timestamp for token expiration (max 24 hours from creation) */
  exp?: number;
  /** Unix timestamp for "not before" - token won't work before this time */
  nbf?: number;
  /** Allow MP4 downloads if video has downloads enabled */
  downloadable?: boolean;
  /** Array of access rules for IP and geo-based restrictions */
  accessRules?: Array<{
    /** Rule type: 'any' matches all, 'ip.src' for IP ranges, 'ip.geoip.country' for countries */
    type: "any" | "ip.src" | "ip.geoip.country";
    /** Action to take when rule matches: 'allow' or 'block' */
    action: "allow" | "block";
    /** Array of 2-letter ISO country codes (for ip.geoip.country type) */
    country?: string[];
    /** Array of IP ranges/CIDRs (for ip.src type) */
    ip?: string[];
  }>;
}

/**
 * Generates a signed token for accessing restricted Cloudflare Stream videos.
 * 
 * @param account_id - Your Cloudflare account ID
 * @param api_token - Your Cloudflare API token with Stream permissions
 * @param video_uid - The unique ID of the restricted video
 * @param restrictions - Optional access restrictions for the token
 * @returns Promise resolving to the signed token response
 * 
 * @example
 * ```typescript
 * // Basic token (1 hour expiration)
 * const token = await getRestrictedVideoToken(
 *   "account-id",
 *   "api-token", 
 *   "video-uid"
 * );
 * 
 * // Token with custom restrictions
 * const restrictedToken = await getRestrictedVideoToken(
 *   "account-id",
 *   "api-token",
 *   "video-uid",
 *   {
 *     exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
 *     downloadable: true,
 *     accessRules: [
 *       { type: "ip.geoip.country", action: "allow", country: ["US", "CA"] },
 *       { type: "any", action: "block" }
 *     ]
 *   }
 * );
 * ```
 */
export async function getRestrictedVideoToken(
  account_id: string,
  api_token: string,
  video_uid: string,
  restrictions?: SignedUrlRestrictions,
) {
  try {
    // Default to 1 hour expiration if no restrictions provided
    const defaultRestrictions: SignedUrlRestrictions = restrictions || {
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    };

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account_id}/stream/${video_uid}/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${api_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(defaultRestrictions),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to get CF video token: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting Cloudflare video token:", error);
    throw error;
  }
}

/**
 * Configuration options for generating iframe embed codes.
 */
export interface IframeConfig {
  /** Your Cloudflare Stream customer domain (e.g., "customer-abc123.cloudflarestream.com") */
  customer_domain: string;
  /** Iframe width in pixels (default: 1280) */
  width?: number;
  /** Iframe height in pixels (default: 720) */
  height?: number;
  /** Allow fullscreen mode (default: true) */
  allowFullscreen?: boolean;
  /** Auto-start video playback */
  autoplay?: boolean;
  /** Start video muted */
  muted?: boolean;
  /** Show video controls */
  controls?: boolean;
  /** Loop video playback */
  loop?: boolean;
  /** Preload video metadata */
  preload?: boolean;
  /** Primary color for player UI (CSS color value) */
  primaryColor?: string;
  /** Letterbox color or "transparent" to avoid letterboxing */
  letterboxColor?: string;
  /** Default text track language (BCP-47 language code) */
  defaultTextTrack?: string;
}

/**
 * Generates a complete iframe URL with signed token for restricted Cloudflare Stream videos.
 * This is a convenience function that combines token generation with iframe URL creation.
 * 
 * @param account_id - Your Cloudflare account ID
 * @param api_token - Your Cloudflare API token with Stream permissions
 * @param video_uid - The unique ID of the restricted video
 * @param config - Iframe configuration options
 * @param restrictions - Optional access restrictions for the token
 * @returns Promise resolving to iframe URL and configuration object
 * 
 * @example
 * ```typescript
 * const iframeData = await getRestrictedVideoIframeUrl(
 *   "account-id",
 *   "api-token",
 *   "video-uid",
 *   {
 *     customer_domain: "customer-abc123.cloudflarestream.com",
 *     width: 800,
 *     height: 450,
 *     autoplay: true,
 *     muted: true,
 *     controls: true,
 *     primaryColor: "#ff6600"
 *   },
 *   {
 *     exp: Math.floor(Date.now() / 1000) + 6 * 60 * 60, // 6 hours
 *     accessRules: [
 *       { type: "ip.geoip.country", action: "allow", country: ["US", "GB"] }
 *     ]
 *   }
 * );
 * 
 * // Use the generated iframe
 * const iframe = `
 *   <iframe
 *     src="${iframeData.iframe.src}"
 *     width="${iframeData.iframe.width}"
 *     height="${iframeData.iframe.height}"
 *     allowfullscreen="${iframeData.iframe.allowFullscreen}"
 *   ></iframe>
 * `;
 * ```
 */
export async function getRestrictedVideoIframeUrl(
  account_id: string,
  api_token: string,
  video_uid: string,
  config: IframeConfig,
  restrictions?: SignedUrlRestrictions,
) {
  try {
    // Get the signed token for the restricted video
    const tokenResponse = await getRestrictedVideoToken(
      account_id,
      api_token,
      video_uid,
      restrictions,
    );

    if (!tokenResponse.result?.token) {
      throw new Error("Failed to get signed token from response");
    }

    const token = tokenResponse.result.token;
    
    // Build query parameters for player configuration
    const params = new URLSearchParams();
    
    if (config.autoplay !== undefined) params.set("autoplay", config.autoplay.toString());
    if (config.muted !== undefined) params.set("muted", config.muted.toString());
    if (config.controls !== undefined) params.set("controls", config.controls.toString());
    if (config.loop !== undefined) params.set("loop", config.loop.toString());
    if (config.preload !== undefined) params.set("preload", config.preload.toString());
    if (config.primaryColor) params.set("primaryColor", config.primaryColor);
    if (config.letterboxColor) params.set("letterboxColor", config.letterboxColor);
    if (config.defaultTextTrack) params.set("defaultTextTrack", config.defaultTextTrack);

    const queryString = params.toString();
    const baseUrl = `https://${config.customer_domain}/${token}/iframe`;
    const fullUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    return {
      url: fullUrl,
      token: token,
      iframe: {
        src: fullUrl,
        width: config.width || 1280,
        height: config.height || 720,
        allowFullscreen: config.allowFullscreen !== false,
        style: "border: none;",
        allow: "accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;",
      },
    };
  } catch (error) {
    console.error("Error generating restricted video iframe URL:", error);
    throw error;
  }
}