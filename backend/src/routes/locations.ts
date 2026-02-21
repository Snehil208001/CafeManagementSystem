import { Router } from "express";
import prisma from "../db";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Public: list locations (for customer order page when location in URL)
router.get("/public", async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    res.json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: "asc" },
    });
    res.json(locations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name required" });
    }
    const location = await prisma.location.create({
      data: { name, address: address || null },
    });
    res.status(201).json(location);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create location" });
  }
});

export default router;
