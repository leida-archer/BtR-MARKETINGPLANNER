import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma";
import { postInclude } from "../_lib/postInclude";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string | undefined;

  // ── Individual post operations (when ?id=xxx is present) ──
  if (id) {
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

      if (tagIds !== undefined) {
        await prisma.postTag.deleteMany({ where: { postId: id } });
      }
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

    if (req.method === "PATCH") {
      const { action } = req.body;

      if (action === "status") {
        const { status, sortOrder } = req.body;
        const post = await prisma.post.update({
          where: { id },
          data: { status, ...(sortOrder !== undefined ? { sortOrder } : {}) },
          include: postInclude,
        });
        return res.json(post);
      }

      if (action === "schedule") {
        const { scheduledDate, scheduledTime } = req.body;
        const post = await prisma.post.update({
          where: { id },
          data: {
            scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
            ...(scheduledTime !== undefined ? { scheduledTime } : {}),
          },
        });
        return res.json(post);
      }

      return res.status(400).json({ error: "Invalid action" });
    }

    if (req.method === "DELETE") {
      await prisma.post.delete({ where: { id } });
      return res.json({ success: true });
    }

    res.setHeader("Allow", "GET, PUT, PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Collection operations (no id) ──
  if (req.method === "GET") {
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
        { title: { contains: search as string, mode: "insensitive" } },
        { caption: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      include: postInclude,
      orderBy: [{ sortOrder: "asc" }, { scheduledDate: "asc" }, { createdAt: "desc" }],
    });

    return res.json(posts);
  }

  if (req.method === "POST") {
    const { title, platform, postType, status, priority, scheduledDate, scheduledTime, caption, notes, mediaUrl, eventId, collaboratorId, tagIds, assetIds } = req.body;

    const post = await prisma.post.create({
      data: {
        title,
        platform,
        postType,
        status: status || "idea",
        priority: priority || "medium",
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

    return res.status(201).json(post);
  }

  if (req.method === "PATCH") {
    const { updates } = req.body; // [{ id, sortOrder }]
    await Promise.all(
      updates.map((u: { id: string; sortOrder: number }) =>
        prisma.post.update({ where: { id: u.id }, data: { sortOrder: u.sortOrder } })
      )
    );
    return res.json({ success: true });
  }

  res.setHeader("Allow", "GET, POST, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}
