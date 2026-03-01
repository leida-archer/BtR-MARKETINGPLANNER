import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
