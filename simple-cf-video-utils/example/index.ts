/// <reference types="node" />

import "dotenv/config";
import { makeVideoUploadUrl, makeRestrictedVideoUploadUrl, getRestrictedVideoToken, getRestrictedVideoIframeUrl } from "../src/index";


const account_id = process.env.CF_ACCOUNT_ID as string;
const api_token = process.env.CF_API_TOKEN as string;
const customer_domain = process.env.CF_STREAM_CUSTOMER_DOMAIN as string;


async function main() {

  // Example 1: Regular video upload
  // try {
  //   const response = await makeVideoUploadUrl(account_id, api_token, 3600);
  //   console.log("Cloudflare Video Upload URL Response:", response);
  // } catch (error) {
  //   console.error("Error in main function:", error);
  // }

  // Example 2: Restricted video upload
  // try {
  //   const response = await makeRestrictedVideoUploadUrl(account_id, api_token, 3600);
  //   console.log("Cloudflare Restricted Video Upload URL Response:", response);
  // } catch (error) {
  //   console.error("Error in main function:", error);
  // }

  // Example 3: Get token for restricted video
  const video_uid = "f705af6dfed24faaa2fc152f238b7aed";

  try {
    // Basic token (1 hour expiration)
    const basicToken = await getRestrictedVideoToken(account_id, api_token, video_uid);
    console.log("Basic Token Response:", basicToken);
    
    // Advanced token with custom restrictions
    const advancedToken = await getRestrictedVideoToken(account_id, api_token, video_uid, {
      exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
      downloadable: true,
      accessRules: [
        {
          type: "ip.geoip.country",
          action: "allow",
          country: ["US", "GB", "CA"]
        },
        {
          type: "any",
          action: "block"
        }
      ]
    });
    console.log("Advanced Token Response:", advancedToken);
    
    // Example iframe URL with token
    if (basicToken.result?.token) {
      const iframeUrl = `https://${customer_domain}/${basicToken.result.token}/iframe`;
      console.log("Iframe URL:", iframeUrl);
      
      const manifestUrl = `https://${customer_domain}/${basicToken.result.token}/manifest/video.m3u8`;
      console.log("Manifest URL:", manifestUrl);
    }
    
  } catch (error) {
    console.error("Error getting restricted video token:", error);
  }
}

async function testIframeGeneration() {
  const video_uid = "f705af6dfed24faaa2fc152f238b7aed";

  try {
    // Basic iframe URL generation
    const basicIframe = await getRestrictedVideoIframeUrl(
      account_id,
      api_token,
      video_uid,
      {
        customer_domain,
        width: 1280,
        height: 720,
        autoplay: true,
        muted: true,
        controls: true,
      }
    );
    console.log("Basic Iframe Result:", basicIframe);

    // Advanced iframe with restrictions and custom styling
    const advancedIframe = await getRestrictedVideoIframeUrl(
      account_id,
      api_token,
      video_uid,
      {
        customer_domain,
        width: 800,
        height: 450,
        autoplay: false,
        controls: true,
        loop: true,
        primaryColor: "#ff6600",
        letterboxColor: "transparent",
      },
      {
        exp: Math.floor(Date.now() / 1000) + 6 * 60 * 60, // 6 hours
        downloadable: false,
        accessRules: [
          {
            type: "ip.geoip.country",
            action: "allow",
            country: ["US", "CA", "GB", "AU"]
          },
          {
            type: "any",
            action: "block"
          }
        ]
      }
    );
    console.log("Advanced Iframe Result:", advancedIframe);

    // Generate HTML for embedding
    const htmlEmbed = `
<iframe
  src="${advancedIframe.iframe.src}"
  width="${advancedIframe.iframe.width}"
  height="${advancedIframe.iframe.height}"
  style="${advancedIframe.iframe.style}"
  allow="${advancedIframe.iframe.allow}"
  allowfullscreen="${advancedIframe.iframe.allowFullscreen}"
></iframe>`;
    
    console.log("HTML Embed Code:", htmlEmbed);

  } catch (error) {
    console.error("Error in iframe generation test:", error);
  }
}

// Run the main function
main();

// Run the iframe test
// testIframeGeneration();