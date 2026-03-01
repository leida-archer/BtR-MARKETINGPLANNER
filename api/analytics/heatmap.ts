import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const days = parseInt(req.query.days as string) || 90;
  const from = new Date();
  from.setDate(from.getDate() - days);

  const posts = await prisma.post.findMany({
    where: { scheduledDate: { gte: from } },
    select: { scheduledDate: true },
  });

  const countMap = new Map<string, number>();
  for (const post of posts) {
    if (!post.scheduledDate) continue;
    const dateStr = post.scheduledDate.toISOString().split("T")[0];
    countMap.set(dateStr, (countMap.get(dateStr) || 0) + 1);
  }

  const heatmap = Array.from(countMap, ([date, count]) => ({ date, count })).sort(
    (a, b) => a.date.localeCompare(b.date)
  );

  return res.json(heatmap);
}
