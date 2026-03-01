import { Router, Request, Response } from "express";
import prisma from "../db.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  res.json(tags);
});

router.post("/", async (req: Request, res: Response) => {
  const { name, color } = req.body;
  const tag = await prisma.tag.create({ data: { name, color } });
  res.status(201).json(tag);
});

router.put("/:id", async (req: Request, res: Response) => {
  const { name, color } = req.body;
  const tag = await prisma.tag.update({
    where: { id: req.params.id },
    data: { name, color },
  });
  res.json(tag);
});

router.delete("/:id", async (req: Request, res: Response) => {
  await prisma.tag.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export { router as tagsRouter };
