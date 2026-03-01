import prisma from "../db.js";

export interface Conflict {
  platform: string;
  scheduledDate: string;
  scheduledTime: string;
  posts: { id: string; title: string }[];
}

export async function detectConflicts(): Promise<Conflict[]> {
  // Find posts that share the same platform + date + time
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

  const conflicts: Conflict[] = [];
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

  return conflicts;
}
