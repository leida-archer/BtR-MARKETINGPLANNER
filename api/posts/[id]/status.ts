import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../_lib/prisma";
import { postInclude } from "../../_lib/postInclude";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = req.query.id as string;
  const { status, sortOrder } = req.body;

  const post = await prisma.post.update({
    where: { id },
    data: { status, ...(sortOrder !== undefined ? { sortOrder } : {}) },
    include: postInclude,
  });

  return res.json(post);
}
