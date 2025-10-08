/**
 * Creates a Cloudflare Images direct upload URL for uploading images.
 * 
 * @author @mesilicon7
 * 
 * This function generates a temporary upload URL that can be used to directly upload
 * images to Cloudflare Images without routing through your server.
 * 
 * @param account_id - Your Cloudflare account ID (found in Cloudflare dashboard)
 * @param api_token - Your Cloudflare API token with Images:Edit permissions
 * @param metadata - Optional metadata object to attach to the uploaded image
 * @param requireSignedURLs - Whether the uploaded image should require signed URLs for access
 * 
 * @returns Promise that resolves to the Cloudflare API response containing upload URL and form data
 * 
 * @throws {Error} When the API request fails or returns non-200 status
 * 
 * @example
 * ```typescript
 * const uploadData = await makeCfImageURL(
 *   "your-account-id",
 *   "your-api-token",
 *   { alt: "Profile picture", userId: "123" },
 *   false
 * );
 * 
 * // uploadData.result contains:
 * // - id: string (image ID)
 * // - uploadURL: string (direct upload URL)
 * // - form: object (form data to include in upload)
 * ```
 */
export async function makeCfImageURL(
  account_id: string,
  api_token: string,
  metadata = {},
  requireSignedURLs = false,
) {
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account_id}/images/v2/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${api_token}`,
        },
        body: (() => {
          const formData = new FormData();
          formData.append("requireSignedURLs", requireSignedURLs.toString());
          formData.append("metadata", JSON.stringify(metadata));
          return formData;
        })(),
      },
    );

    if (!res.ok) {
      throw new Error(
        `Failed to get CF image URL: ${res.status} ${res.statusText}`,
      );
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error getting Cloudflare image URL:", error);
    throw error;
  }
}


/**
 * Generate a signed Cloudflare Images URL for secure image delivery.
 * 
 * Creates a time-limited, cryptographically signed URL for accessing private images
 * stored in Cloudflare Images. This is essential when `requireSignedURLs` is enabled
 * on your images or when you need to control access to specific image variants.
 * 
 * @param accountHash - The Cloudflare Images delivery account hash (found in your Images dashboard)
 * @param imageId - The unique identifier of the image (returned when uploading)
 * @param variant - The image variant/transformation to apply (e.g., "public", "thumbnail", "avatar")
 * @param signingKey - Your Cloudflare Images signing key (generate in Images settings)
 * @param expiresInSeconds - URL expiration time in seconds from now (default: 3600 = 1 hour)
 * 
 * @returns Promise that resolves to a signed URL string ready for use in frontend applications
 * 
 * @throws {Error} When crypto operations fail or invalid parameters are provided
 * 
 * @example
 * ```typescript
 * // Generate a 24-hour signed URL for a user avatar
 * const signedUrl = await getSignedImageUrlUsingID(
 *   "Vi7wi5KSItxGFsWRG2Us6Q",
 *   "2cdc28f0-017a-49c4-9ed7-87056c83901",
 *   "avatar",
 *   "your-signing-key",
 *   86400 // 24 hours
 * );
 * 
 * // Use the URL in your HTML
 * // <img src={signedUrl} alt="User avatar" />
 * ```
 * 
 * @example
 * ```typescript
 * // Generate a short-lived URL for sensitive content
 * const tempUrl = await getSignedImageUrlUsingID(
 *   "Vi7wi5KSItxGFsWRG2Us6Q",
 *   "sensitive-image-id",
 *   "private",
 *   "your-signing-key",
 *   300 // 5 minutes
 * );
 * ```
 */
export async function getSignedImageUrlUsingID(
  accountHash: string,
  imageId: string,
  variant: string,
  signingKey: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const bufferToHex = (buffer: ArrayBuffer) =>
    [...new Uint8Array(buffer)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");

  // Expiration timestamp (UNIX seconds)
  const expiration = Math.floor(Date.now() / 1000) + expiresInSeconds;

  // Create the URL object to work with
  const url = new URL(`https://imagedelivery.net/${accountHash}/${imageId}/${variant}`);
  url.searchParams.set("exp", expiration.toString());

  // The string to sign: pathname + "?" + searchParams (e.g., "/accountHash/imageId/variant?exp=timestamp")
  const stringToSign = url.pathname + "?" + url.searchParams.toString();

  // Generate the HMAC signature using Web Crypto API
  const encoder = new TextEncoder();
  const secretKeyData = encoder.encode(signingKey);
  const key = await crypto.subtle.importKey(
    "raw",
    secretKeyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(stringToSign));
  const signature = bufferToHex(mac);

  // Add the signature to the URL
  url.searchParams.set("sig", signature);

  return url.toString();
}

