import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../_lib/prisma";
import { generateCampaignPosts } from "../../_lib/campaignTemplates";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = req.query.id as string;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return res.status(404).json({ error: "Event not found" });

  const templates = generateCampaignPosts(
    event.name,
    event.venue || "TBD",
    event.date,
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

  return res.status(201).json({ generated: posts.length, posts });
}
