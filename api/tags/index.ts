import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
    return res.json(tags);
  }

  if (req.method === "POST") {
    const { name, color } = req.body;
    const tag = await prisma.tag.create({ data: { name, color } });
    return res.status(201).json(tag);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
