import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma";
import { postInclude } from "../_lib/postInclude";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;

  if (req.method === "GET") {
    const post = await prisma.post.findUnique({
      where: { id },
      include: postInclude,
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    return res.json(post);
  }

  if (req.method === "PUT") {
    const { title, platform, postType, status, priority, scheduledDate, scheduledTime, caption, notes, mediaUrl, eventId, collaboratorId, tagIds, assetIds } = req.body;

    // Replace tags
    if (tagIds !== undefined) {
      await prisma.postTag.deleteMany({ where: { postId: id } });
    }
    // Replace assets
    if (assetIds !== undefined) {
      await prisma.postAsset.deleteMany({ where: { postId: id } });
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        platform,
        postType,
        status,
        priority,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        scheduledTime: scheduledTime || null,
        caption: caption || null,
        notes: notes || null,
        mediaUrl: mediaUrl || null,
        eventId: eventId || null,
        collaboratorId: collaboratorId || null,
        tags: tagIds?.length
          ? { create: tagIds.map((tagId: string) => ({ tagId })) }
          : undefined,
        assets: assetIds?.length
          ? { create: assetIds.map((assetId: string) => ({ assetId })) }
          : undefined,
      },
      include: postInclude,
    });

    return res.json(post);
  }

  if (req.method === "DELETE") {
    await prisma.post.delete({ where: { id } });
    return res.json({ success: true });
  }

  res.setHeader("Allow", "GET, PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
