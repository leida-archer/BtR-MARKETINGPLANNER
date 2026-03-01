import type { VercelRequest, VercelResponse } from "@vercel/node";
import { del } from "@vercel/blob";
import { prisma } from "../_lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = req.query.id as string;
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) return res.status(404).json({ error: "Asset not found" });

  // Delete from Vercel Blob
  try {
    await del(asset.url, { token: process.env.BtRSM_READ_WRITE_TOKEN });
  } catch {
    // Blob may already be deleted — continue with DB cleanup
  }

  // Delete from database (cascades to PostAsset)
  await prisma.asset.delete({ where: { id } });

  return res.json({ success: true });
}
