import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request: req as any,
      token: process.env.BtRSM_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname: string) => {
        return {
          allowedContentTypes: ["image/*", "video/*", "audio/*"],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100 MB
        };
      },
      onUploadCompleted: async () => {
        // DB record created by client POST to /api/assets after upload
      },
    });

    return res.json(jsonResponse);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
