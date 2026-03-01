import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

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
