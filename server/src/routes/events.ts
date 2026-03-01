import { Router, Request, Response } from "express";
import prisma from "../db.js";
import { generateCampaignPosts } from "../services/campaignTemplates.js";

const router = Router();

// GET /api/events
router.get("/", async (_req: Request, res: Response) => {
  const events = await prisma.event.findMany({
    include: {
      posts: {
        select: { id: true, status: true, platform: true },
      },
    },
    orderBy: { date: "asc" },
  });
  res.json(events);
});

// GET /api/events/:id
router.get("/:id", async (req: Request, res: Response) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: {
      posts: {
        include: {
          collaborator: { select: { id: true, name: true } },
          tags: { include: { tag: true } },
        },
        orderBy: { scheduledDate: "asc" },
      },
    },
  });
  if (!event) return res.status(404).json({ error: "Event not found" });
  res.json(event);
});

// POST /api/events
router.post("/", async (req: Request, res: Response) => {
  const { name, venue, date, description, imageUrl } = req.body;
  const event = await prisma.event.create({
    data: { name, venue, date: new Date(date), description, imageUrl },
  });
  res.status(201).json(event);
});

// PUT /api/events/:id
router.put("/:id", async (req: Request, res: Response) => {
  const { name, venue, date, description, imageUrl } = req.body;
  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: { name, venue, date: date ? new Date(date) : undefined, description, imageUrl },
  });
  res.json(event);
});

// DELETE /api/events/:id
router.delete("/:id", async (req: Request, res: Response) => {
  await prisma.event.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// POST /api/events/:id/generate-campaign
router.post("/:id/generate-campaign", async (req: Request, res: Response) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) return res.status(404).json({ error: "Event not found" });

  const templates = generateCampaignPosts(
    event.id,
    event.name,
    event.venue || "TBD",
    event.date
  );

  const posts = await Promise.all(
    templates.map((t) =>
      prisma.post.create({
        data: {
          title: t.title,
          platform: t.platform,
          postType: t.postType,
          status: t.status,
          priority: t.priority,
          scheduledDate: t.scheduledDate,
          scheduledTime: t.scheduledTime,
          caption: t.caption,
          eventId: event.id,
        },
      })
    )
  );

  res.status(201).json({ generated: posts.length, posts });
});

export { router as eventsRouter };
