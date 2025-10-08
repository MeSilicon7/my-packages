import { createHmac, createHash } from "node:crypto";

/**
 * Generates AWS4 signature key for request signing
 * @param key - The secret access key
 * @param dateStamp - Date in YYYYMMDD format
 * @param regionName - AWS region name
 * @param serviceName - AWS service name (e.g., 's3')
 * @returns The signing key as a Buffer
 */
function getSignatureKey(
  key: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
) {
  const kDate = createHmac("sha256", "AWS4" + key).update(dateStamp).digest();
  const kRegion = createHmac("sha256", kDate).update(regionName).digest();
  const kService = createHmac("sha256", kRegion).update(serviceName).digest();
  const kSigning = createHmac("sha256", kService)
    .update("aws4_request")
    .digest();
  return kSigning;
}

/**
 * Builds a canonical query string from URL parameters
 * @param params - URLSearchParams object containing query parameters
 * @returns Canonical query string with sorted and encoded parameters
 */
function buildCanonicalQueryString(params: URLSearchParams) {
  return Array.from(params.entries())
    .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
    .map(
      ([k, v]) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
    )
    .join("&");
}

/**
 * Generates a pre-signed URL for uploading files to Cloudflare R2
 * @param fileName - Name of the file to upload (including path if nested)
 * @param accountId - Cloudflare account ID
 * @param accessKeyId - R2 access key ID
 * @param secretAccessKey - R2 secret access key
 * @param bucketName - Name of the R2 bucket
 * @param expiresIn - URL expiration time in seconds
 * @param contentType - MIME type of the file to upload
 * @returns Promise that resolves to the pre-signed upload URL
 * @example
 * ```typescript
 * const uploadUrl = await getPreSignedUploadUrl(
 *   'images/photo.jpg',
 *   'your-account-id',
 *   'your-access-key',
 *   'your-secret-key',
 *   'my-bucket',
 *   3600, // 1 hour
 *   'image/jpeg'
 * );
 * ```
 */
export async function getPreSignedUploadUrl(
  fileName: string,
  accountId: string,
  accessKeyId: string,
  secretAccessKey: string,
  bucketName: string,
  expiresIn: number,
  contentType: string
): Promise<string> {
  const endpoint = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`;
  const region = "auto";
  const service = "s3";

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const credential = `${accessKeyId}/${credentialScope}`;

  const queryParams = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": expiresIn.toString(),
    "X-Amz-SignedHeaders": "content-type;host",
    "X-Amz-Content-Sha256": "UNSIGNED-PAYLOAD",
    "x-id": "PutObject",
  });

  const canonicalQueryString = buildCanonicalQueryString(queryParams);

  const canonicalUri = `/${fileName}`;
  const canonicalHeaders = `content-type:${contentType}\nhost:${bucketName}.${accountId}.r2.cloudflarestorage.com\n`;
  const signedHeaders = "content-type;host";
  const payloadHash = "UNSIGNED-PAYLOAD";

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");

  const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signature = createHmac("sha256", signingKey)
    .update(stringToSign)
    .digest("hex");

  queryParams.set("X-Amz-Signature", signature);

  return `${endpoint}${canonicalUri}?${buildCanonicalQueryString(queryParams)}`;
}

/**
 * Generates a pre-signed URL for downloading files from Cloudflare R2
 * @param fileName - Name of the file to download (including path if nested)
 * @param accountId - Cloudflare account ID
 * @param accessKeyId - R2 access key ID
 * @param secretAccessKey - R2 secret access key
 * @param bucketName - Name of the R2 bucket
 * @param expiresIn - URL expiration time in seconds
 * @returns Promise that resolves to the pre-signed download URL
 * @example
 * ```typescript
 * const downloadUrl = await getPreSignedDownloadUrl(
 *   'images/photo.jpg',
 *   'your-account-id',
 *   'your-access-key',
 *   'your-secret-key',
 *   'my-bucket',
 *   3600 // 1 hour
 * );
 * ```
 */
export async function getPreSignedDownloadUrl(
  fileName: string,
  accountId: string,
  accessKeyId: string,
  secretAccessKey: string,
  bucketName: string,
  expiresIn: number
): Promise<string> {
  const endpoint = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`;
  const region = "auto";
  const service = "s3";

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const credential = `${accessKeyId}/${credentialScope}`;

  const queryParams = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": expiresIn.toString(),
    "X-Amz-SignedHeaders": "host",
    "X-Amz-Content-Sha256": "UNSIGNED-PAYLOAD",
    "x-id": "GetObject",
  });

  const canonicalQueryString = buildCanonicalQueryString(queryParams);

  const canonicalUri = `/${fileName}`;
  const canonicalHeaders = `host:${bucketName}.${accountId}.r2.cloudflarestorage.com\n`;
  const signedHeaders = "host";
  const payloadHash = "UNSIGNED-PAYLOAD";

  const canonicalRequest = [
    "GET",
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");

  const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signature = createHmac("sha256", signingKey)
    .update(stringToSign)
    .digest("hex");

  queryParams.set("X-Amz-Signature", signature);

  return `${endpoint}${canonicalUri}?${buildCanonicalQueryString(queryParams)}`;
}

