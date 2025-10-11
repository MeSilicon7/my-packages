import 'dotenv/config';
import { getPreSignedUploadUrl } from "@mesilicon7/simple-r2-utils";

export async function loader({request}: {request: Request}) {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    // Simulate file upload progress
    // const progress = simulateFileUpload(file);

    return new Response(JSON.stringify({ progress }), {
        headers: {
            "Content-Type": "application/json"
        }
    });
}