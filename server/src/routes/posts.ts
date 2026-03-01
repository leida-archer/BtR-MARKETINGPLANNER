import { Router, Request, Response } from "express";
import prisma from "../db.js";

const router = Router();

// GET /api/posts — list with filters
router.get("/", async (req: Request, res: Response) => {
  const { status, platform, eventId, collaboratorId, tagId, from, to, search } = req.query;

  const where: any = {};
  if (status) where.status = status;
  if (platform) where.platform = platform;
  if (eventId) where.eventId = eventId;
  if (collaboratorId) where.collaboratorId = collaboratorId;
  if (tagId) where.tags = { some: { tagId: tagId as string } };
  if (from || to) {
    where.scheduledDate = {};
    if (from) where.scheduledDate.gte = new Date(from as string);
    if (to) where.scheduledDate.lte = new Date(to as string);
  }
  if (search) {
    where.OR = [
      { title: { contains: search as string } },
      { caption: { contains: search as string } },
    ];
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      event: { select: { id: true, name: true } },
      collaborator: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
      assets: { include: { asset: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { scheduledDate: "asc" }, { createdAt: "desc" }],
  });

  res.json(posts);
});

// GET /api/posts/:id
router.get("/:id", async (req: Request, res: Response) => {
  const post = await prisma.post.findUnique({
    where: { id: req.params.id },
    include: {
      event: true,
      collaborator: true,
      tags: { include: { tag: true } },
      assets: { include: { asset: true } },
    },
  });
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

// POST /api/posts
router.post("/", async (req: Request, res: Response) => {
  const { title, platform, postType, status, priority, scheduledDate, scheduledTime, caption, notes, mediaUrl, eventId, collaboratorId, tagIds } = req.body;

  const post = await prisma.post.create({
    data: {
      title,
      platform,
      postType,
      status: status || "idea",
      priority: priority || "medium",
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      scheduledTime,
      caption,
      notes,
      mediaUrl,
      eventId: eventId || null,
      collaboratorId: collaboratorId || null,
      tags: tagIds?.length
        ? { create: tagIds.map((tagId: string) => ({ tagId })) }
        : undefined,
    },
    include: {
      event: { select: { id: true, name: true } },
      collaborator: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
      assets: { include: { asset: true } },
    },
  });

  res.status(201).json(post);
});

// PUT /api/posts/:id
router.put("/:id", async (req: Request, res: Response) => {
  const { title, platform, postType, status, priority, scheduledDate, scheduledTime, caption, notes, mediaUrl, eventId, collaboratorId, tagIds } = req.body;

  // Update tags: delete existing, create new
  if (tagIds !== undefined) {
    await prisma.postTag.deleteMany({ where: { postId: req.params.id } });
  }

  const post = await prisma.post.update({
    where: { id: req.params.id },
    data: {
      title,
      platform,
      postType,
      status,
      priority,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      scheduledTime,
      caption,
      notes,
      mediaUrl,
      eventId: eventId || null,
      collaboratorId: collaboratorId || null,
      tags: tagIds?.length
        ? { create: tagIds.map((tagId: string) => ({ tagId })) }
        : undefined,
    },
    include: {
      event: { select: { id: true, name: true } },
      collaborator: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
      assets: { include: { asset: true } },
    },
  });

  res.json(post);
});

// PATCH /api/posts/:id/status — for Kanban drag
router.patch("/:id/status", async (req: Request, res: Response) => {
  const { status, sortOrder } = req.body;
  const post = await prisma.post.update({
    where: { id: req.params.id },
    data: { status, ...(sortOrder !== undefined ? { sortOrder } : {}) },
    include: {
      event: { select: { id: true, name: true } },
      collaborator: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
    },
  });
  res.json(post);
});

// PATCH /api/posts/:id/schedule — for Calendar drag
router.patch("/:id/schedule", async (req: Request, res: Response) => {
  const { scheduledDate, scheduledTime } = req.body;
  const post = await prisma.post.update({
    where: { id: req.params.id },
    data: {
      scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
      ...(scheduledTime !== undefined ? { scheduledTime } : {}),
    },
  });
  res.json(post);
});

// PATCH /api/posts/reorder — bulk reorder within column
router.patch("/reorder", async (req: Request, res: Response) => {
  const { updates } = req.body; // [{ id, sortOrder }]
  await Promise.all(
    updates.map((u: { id: string; sortOrder: number }) =>
      prisma.post.update({ where: { id: u.id }, data: { sortOrder: u.sortOrder } })
    )
  );
  res.json({ success: true });
});

// DELETE /api/posts/:id
router.delete("/:id", async (req: Request, res: Response) => {
  await prisma.post.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export { router as postsRouter };
