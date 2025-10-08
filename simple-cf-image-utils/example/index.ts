/// <reference types="node" />

import 'dotenv/config';
import { makeCfImageURL, getSignedImageUrlUsingID } from '../src/index';

async function main() {

  const account_id = process.env.CF_ACCOUNT_ID as string;
  const api_token = process.env.CF_API_TOKEN as string;

  const metadata = {
    custom_field: 'custom_value',
  };

  const requireSignedURLs = true;

  try {
    const response = await makeCfImageURL(account_id, api_token, metadata, requireSignedURLs);
    console.log('Cloudflare Image Upload URL Response:', response);
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

main();

const accountHash = process.env.CF_ACCOUNT_HASH as string;
const signingKey = process.env.CF_IMAGE_SIGNED_KEY as string;
const imageId = "fdc6b22b-c28a-4e80-da75-a24acc847801";

async function testSignedUrl() {
  try {
    const signedUrl = await getSignedImageUrlUsingID(
      accountHash,
      imageId,
      "thumbnail",   // or your custom variant
      signingKey,
      600         // valid for 10 minutes
    );
    
    console.log(signedUrl);
  } catch (error) {
    console.error('Error generating signed URL:', error);
  }
}

testSignedUrl();
