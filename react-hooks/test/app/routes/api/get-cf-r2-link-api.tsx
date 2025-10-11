import "dotenv/config";
import { getPreSignedUploadUrl } from "@mesilicon7/simple-r2-utils";

export async function loader({ request }: { request: Request }) {
  const urlObj = new URL(request.url);

  // Read query params like Hono's c.req.query()
  const fileType = urlObj.searchParams.get("fileType") || "text/plain";
  const fileName = urlObj.searchParams.get("fileName") || "test-object.txt";

  // Your Cloudflare env variables (via Remix loader context or process.env)
  const {
    CF_ACCOUNT_ID,
    CF_R2_ACCESS_TOKEN,
    CF_R2_SECRET_TOKEN,
    CF_R2_BUCKET_NAME,
  } = process.env;

  const url = await getPreSignedUploadUrl(
    fileName,
    CF_ACCOUNT_ID!,
    CF_R2_ACCESS_TOKEN!,
    CF_R2_SECRET_TOKEN!,
    CF_R2_BUCKET_NAME!,
    60 * 30, // 30 minutes
    fileType
  );

  return Response.json({ url });
}
