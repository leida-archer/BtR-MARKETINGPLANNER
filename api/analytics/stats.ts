import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const [total, byStatus, byPlatform, upcoming] = await Promise.all([
    prisma.post.count(),
    prisma.post.groupBy({ by: ["status"], _count: true }),
    prisma.post.groupBy({ by: ["platform"], _count: true }),
    prisma.post.count({
      where: {
        scheduledDate: { gte: new Date() },
        status: { not: "posted" },
      },
    }),
  ]);

  return res.json({
    total,
    upcoming,
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
    byPlatform: Object.fromEntries(byPlatform.map((p) => [p.platform, p._count])),
  });
}
