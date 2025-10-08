import 'dotenv/config';
import { getPreSignedUploadUrl } from "../src/index.ts";


const accountId = process.env.CF_ACCOUNT_ID as string;
const accessKeyId = process.env.CF_ACCESS_KEY_ID as string;
const secretAccessKey = process.env.CF_SECRET_ACCESS_KEY as string;
const publicBucketName = "my-bucket";
const publicFileName = "awesome2.txt";
const expiresIn = 3600; // URL expiration time in seconds

const link = await getPreSignedUploadUrl(
  publicFileName,
  accountId,
  accessKeyId,
  secretAccessKey,
  publicBucketName,
  expiresIn,
  "text/plain"
);

// Prepare test content
const content = "test to public bucket!";
const blob = new Blob([content], { type: "text/plain" });

console.log("Generated upload URL:", link);
console.log("Uploading file...");

fetch(link, {
  method: "PUT",
  body: blob,
  headers: { "Content-Type": "text/plain" },
})
  .then(async (response) => {
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      console.log("✅ File uploaded successfully!");
    } else {
      console.error("❌ Upload failed:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("Error details:", errorText);
    }
  })
  .catch((error) => {
    console.error("Error uploading file:", error);
  });
