import { Router, Request, Response } from "express";
import prisma from "../db.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const collaborators = await prisma.collaborator.findMany({
    orderBy: { name: "asc" },
    include: { posts: { select: { id: true } } },
  });
  res.json(collaborators);
});

router.post("/", async (req: Request, res: Response) => {
  const { name, role, avatarUrl } = req.body;
  const collab = await prisma.collaborator.create({ data: { name, role, avatarUrl } });
  res.status(201).json(collab);
});

router.put("/:id", async (req: Request, res: Response) => {
  const { name, role, avatarUrl } = req.body;
  const collab = await prisma.collaborator.update({
    where: { id: req.params.id },
    data: { name, role, avatarUrl },
  });
  res.json(collab);
});

router.delete("/:id", async (req: Request, res: Response) => {
  await prisma.collaborator.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export { router as collaboratorsRouter };
