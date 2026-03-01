import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const assets = await prisma.asset.findMany({
      orderBy: { createdAt: "desc" },
      include: { posts: { select: { postId: true } } },
    });
    return res.json(assets);
  }

  if (req.method === "POST") {
    const { filename, url, mimeType, fileSize } = req.body;
    const asset = await prisma.asset.create({
      data: { filename, url, mimeType, fileSize },
    });
    return res.json(asset);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
