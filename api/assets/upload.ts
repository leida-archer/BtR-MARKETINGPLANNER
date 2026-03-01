import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { prisma } from "../_lib/prisma";

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
      onUploadCompleted: async ({ blob }) => {
        // Save metadata to Postgres
        await prisma.asset.create({
          data: {
            filename: blob.pathname.split("/").pop() || blob.pathname,
            url: blob.url,
            mimeType: blob.contentType || "application/octet-stream",
            fileSize: blob.size,
          },
        });
      },
    });

    return res.json(jsonResponse);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
