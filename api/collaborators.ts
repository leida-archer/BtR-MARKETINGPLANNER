import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "./_lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const collaborators = await prisma.collaborator.findMany({
      orderBy: { name: "asc" },
      include: { posts: { select: { id: true } } },
    });
    return res.json(collaborators);
  }

  if (req.method === "POST") {
    const { name, role, avatarUrl } = req.body;
    const collab = await prisma.collaborator.create({ data: { name, role, avatarUrl } });
    return res.status(201).json(collab);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
