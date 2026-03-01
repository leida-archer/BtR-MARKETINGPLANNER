import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma";
import { postInclude } from "../_lib/postInclude";
import { generateCampaignPosts } from "../_lib/campaignTemplates";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string | undefined;

  // ── Individual event operations (when ?id=xxx is present) ──
  if (id) {
    if (req.method === "GET") {
      const event = await prisma.event.findUnique({
        where: { id },
        include: {
          posts: {
            include: postInclude,
            orderBy: { scheduledDate: "asc" },
          },
        },
      });
      if (!event) return res.status(404).json({ error: "Event not found" });
      return res.json(event);
    }

    if (req.method === "PUT") {
      const { name, venue, date, description, imageUrl } = req.body;
      const event = await prisma.event.update({
        where: { id },
        data: { name, venue, date: date ? new Date(date) : undefined, description, imageUrl },
      });
      return res.json(event);
    }

    if (req.method === "POST") {
      // Generate campaign posts for this event
      const event = await prisma.event.findUnique({ where: { id } });
      if (!event) return res.status(404).json({ error: "Event not found" });

      const templates = generateCampaignPosts(event.name, event.venue || "TBD", event.date);
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
      return res.status(201).json({ generated: posts.length, posts });
    }

    if (req.method === "DELETE") {
      await prisma.event.delete({ where: { id } });
      return res.json({ success: true });
    }

    res.setHeader("Allow", "GET, PUT, POST, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Collection operations (no id) ──
  if (req.method === "GET") {
    const events = await prisma.event.findMany({
      include: {
        posts: {
          select: { id: true, status: true, platform: true },
        },
      },
      orderBy: { date: "asc" },
    });
    return res.json(events);
  }

  if (req.method === "POST") {
    const { name, venue, date, description, imageUrl } = req.body;
    const event = await prisma.event.create({
      data: { name, venue, date: new Date(date), description, imageUrl },
    });
    return res.status(201).json(event);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
