import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../../_lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = req.query.id as string;
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
