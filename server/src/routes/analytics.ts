import { Router, Request, Response } from "express";
import prisma from "../db.js";
import { detectConflicts } from "../services/conflictDetector.js";

const router = Router();

// GET /api/analytics/stats
router.get("/stats", async (_req: Request, res: Response) => {
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

  res.json({
    total,
    upcoming,
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
    byPlatform: Object.fromEntries(byPlatform.map((p) => [p.platform, p._count])),
  });
});

// GET /api/analytics/heatmap
router.get("/heatmap", async (req: Request, res: Response) => {
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

  res.json(heatmap);
});

// GET /api/analytics/conflicts
router.get("/conflicts", async (_req: Request, res: Response) => {
  const conflicts = await detectConflicts();
  res.json(conflicts);
});

export { router as analyticsRouter };
