import 'dotenv/config';
import { getPreSignedDownloadUrl } from "../src/index.ts";

const accountId = process.env.CF_ACCOUNT_ID as string;
const accessKeyId = process.env.CF_ACCESS_KEY_ID as string;
const secretAccessKey = process.env.CF_SECRET_ACCESS_KEY as string;
const privateBucketName = "simple-upload";
const privateFileName = "awesome2.txt";
const expiresIn = 3600; 

// URL expiration time in seconds

const link = await getPreSignedDownloadUrl(
  privateFileName,
  accountId,
  accessKeyId,
  secretAccessKey,
  privateBucketName,
  expiresIn
);

console.log("Generated download URL:", link);
console.log("Downloading file...");

