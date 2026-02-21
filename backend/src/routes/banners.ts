import { Router } from "express";
import prisma from "../db";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Public: get active banners
router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          {
            startDate: { lte: now },
            endDate: { gte: now },
          },
          {
            startDate: { lte: now },
            endDate: null,
          },
          {
            startDate: null,
            endDate: { gte: now },
          },
        ],
      },
      orderBy: { position: "asc" },
    });
    res.json(banners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
});

// Manager: get all banners
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { position: "asc" },
    });
    res.json(banners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
});

// Manager: create banner
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { imageUrl, link, position, startDate, endDate } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL required" });
    }

    const banner = await prisma.banner.create({
      data: {
        imageUrl,
        link: link || null,
        position: position ?? 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    res.status(201).json(banner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create banner" });
  }
});

// Manager: update banner
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { imageUrl, link, position, isActive, startDate, endDate } = req.body;

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(imageUrl !== undefined && { imageUrl }),
        ...(link !== undefined && { link }),
        ...(position !== undefined && { position }),
        ...(isActive !== undefined && { isActive }),
        ...(startDate !== undefined && {
          startDate: startDate ? new Date(startDate) : null,
        }),
        ...(endDate !== undefined && {
          endDate: endDate ? new Date(endDate) : null,
        }),
      },
    });
    res.json(banner);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update banner" });
  }
});

// Manager: delete banner
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.banner.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete banner" });
  }
});

export default router;
