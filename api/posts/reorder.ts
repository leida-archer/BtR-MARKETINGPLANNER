import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "../_lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { updates } = req.body; // [{ id, sortOrder }]

  await Promise.all(
    updates.map((u: { id: string; sortOrder: number }) =>
      prisma.post.update({ where: { id: u.id }, data: { sortOrder: u.sortOrder } })
    )
  );

  return res.json({ success: true });
}
