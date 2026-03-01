import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const assets = await prisma.asset.findMany({
    orderBy: { createdAt: "desc" },
    include: { posts: { select: { postId: true } } },
  });

  return res.json(assets);
}
