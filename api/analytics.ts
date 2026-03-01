import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "./_lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const type = req.query.type as string;

  if (type === "stats") {
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

  if (type === "heatmap") {
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

  if (type === "conflicts") {
    const posts = await prisma.post.findMany({
      where: {
        scheduledDate: { not: null },
        scheduledTime: { not: null },
        status: { not: "posted" },
      },
      select: {
        id: true,
        title: true,
        platform: true,
        scheduledDate: true,
        scheduledTime: true,
      },
      orderBy: { scheduledDate: "asc" },
    });

    const groupMap = new Map<string, typeof posts>();
    for (const post of posts) {
      if (!post.scheduledDate || !post.scheduledTime) continue;
      const key = `${post.platform}|${post.scheduledDate.toISOString().split("T")[0]}|${post.scheduledTime}`;
      const group = groupMap.get(key) || [];
      group.push(post);
      groupMap.set(key, group);
    }

    const conflicts: { platform: string; scheduledDate: string; scheduledTime: string; posts: { id: string; title: string }[] }[] = [];
    for (const [key, group] of groupMap) {
      if (group.length > 1) {
        const [platform, date, time] = key.split("|");
        conflicts.push({
          platform,
          scheduledDate: date,
          scheduledTime: time,
          posts: group.map((p) => ({ id: p.id, title: p.title })),
        });
      }
    }

    return res.json(conflicts);
  }

  return res.status(400).json({ error: "Invalid type. Use ?type=stats|heatmap|conflicts" });
}
