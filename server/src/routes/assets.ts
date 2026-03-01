import { Router, Request, Response } from "express";
import prisma from "../db.js";
import { upload } from "../middleware/upload.js";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "../../../uploads");
const thumbsDir = path.join(uploadsDir, "thumbs");

// Ensure thumbs directory exists
if (!fs.existsSync(thumbsDir)) {
  fs.mkdirSync(thumbsDir, { recursive: true });
}

const router = Router();

// GET /api/assets
router.get("/", async (req: Request, res: Response) => {
  const { mimeType, search } = req.query;
  const where: any = {};
  if (mimeType) where.mimeType = { startsWith: mimeType as string };
  if (search) where.filename = { contains: search as string };

  const assets = await prisma.asset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { posts: { select: { postId: true } } },
  });
  res.json(assets);
});

// POST /api/assets/upload
router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  let thumbnailUrl: string | null = null;

  // Generate thumbnail for images
  if (file.mimetype.startsWith("image/")) {
    const thumbFilename = `thumb-${file.filename}`;
    const thumbPath = path.join(thumbsDir, thumbFilename);
    try {
      await sharp(file.path)
        .resize(300, 300, { fit: "cover" })
        .jpeg({ quality: 80 })
        .toFile(thumbPath);
      thumbnailUrl = `/uploads/thumbs/${thumbFilename}`;
    } catch (e) {
      console.error("Thumbnail generation failed:", e);
    }
  }

  const asset = await prisma.asset.create({
    data: {
      filename: file.originalname,
      storagePath: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      fileSize: file.size,
      thumbnailUrl,
    },
  });

  res.status(201).json(asset);
});

// DELETE /api/assets/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const asset = await prisma.asset.findUnique({ where: { id: req.params.id } });
  if (!asset) return res.status(404).json({ error: "Asset not found" });

  // Delete files from disk
  const filePath = path.join(__dirname, "../../..", asset.storagePath);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  if (asset.thumbnailUrl) {
    const thumbPath = path.join(__dirname, "../../..", asset.thumbnailUrl);
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
  }

  await prisma.asset.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// POST /api/posts/:postId/assets/:assetId — attach asset to post
router.post("/:postId/assets/:assetId", async (req: Request, res: Response) => {
  const { postId, assetId } = req.params;
  const link = await prisma.postAsset.create({
    data: { postId, assetId },
  });
  res.status(201).json(link);
});

// DELETE /api/posts/:postId/assets/:assetId — detach asset from post
router.delete("/:postId/assets/:assetId", async (req: Request, res: Response) => {
  const { postId, assetId } = req.params;
  await prisma.postAsset.delete({
    where: { postId_assetId: { postId, assetId } },
  });
  res.json({ success: true });
});

export { router as assetsRouter };
