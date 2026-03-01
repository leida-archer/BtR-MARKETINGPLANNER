import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma";
import { postInclude } from "../_lib/postInclude";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id as string;

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

  if (req.method === "DELETE") {
    await prisma.event.delete({ where: { id } });
    return res.json({ success: true });
  }

  res.setHeader("Allow", "GET, PUT, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
