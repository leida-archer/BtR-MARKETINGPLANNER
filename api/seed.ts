import type { VercelRequest, VercelResponse } from "@vercel/node";
import { prisma } from "./_lib/prisma";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check if already seeded
  const existingCollabs = await prisma.collaborator.count();
  if (existingCollabs > 0) {
    return res.json({ message: "Database already seeded", skipped: true });
  }

  // Seed collaborators
  await prisma.collaborator.createMany({
    data: [
      { name: "Archer", role: "Founder / Content Lead" },
      { name: "Guest DJ", role: "Artist Contributor" },
      { name: "Photo Partner", role: "Photographer / Videographer" },
    ],
  });

  // Seed tags
  await prisma.tag.createMany({
    data: [
      { name: "lineup-reveal", color: "#D6246E" },
      { name: "hype", color: "#E8652B" },
      { name: "UGC", color: "#F2A922" },
      { name: "recap", color: "#8B5CF6" },
      { name: "venue-spotlight", color: "#FF6B6B" },
      { name: "artist-spotlight", color: "#FFAB91" },
      { name: "behind-the-scenes", color: "#6366F1" },
      { name: "community", color: "#10B981" },
      { name: "ticket-push", color: "#F59E0B" },
      { name: "brand-intro", color: "#3B82F6" },
    ],
  });

  // Seed events
  await prisma.event.createMany({
    data: [
      {
        name: "BTR Launch Night",
        venue: "NOVA SD",
        date: new Date("2026-04-18T21:00:00"),
        description: "Beyond the Rhythm's inaugural event. Bass music, immersive production, community first.",
      },
      {
        name: "BTR x FIT Social: Bass Communion",
        venue: "FIT Social",
        date: new Date("2026-06-13T22:00:00"),
        description: "A collaborative night of experimental bass and dubstep at SD's newest venue.",
      },
    ],
  });

  return res.status(201).json({ message: "Database seeded successfully" });
}
