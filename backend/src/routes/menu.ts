import { Router } from "express";
import prisma from "../db";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// Public: get menu (dishes + active offers), optional ?locationId=
router.get("/", async (req, res) => {
  try {
    let locationId = req.query.locationId as string | undefined;
    if (!locationId) {
      const first = await prisma.location.findFirst({ orderBy: { name: "asc" } });
      locationId = first?.id ?? undefined;
    }
    const dishWhere = { isAvailable: true, ...(locationId && { locationId }) };
    const dishes = await prisma.dish.findMany({
      where: dishWhere,
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    const now = new Date();
    const offerWhere = {
      isActive: true,
      AND: [
        {
          OR: [
            { startDate: null, endDate: null },
            { startDate: { lte: now }, endDate: { gte: now } },
            { startDate: { lte: now }, endDate: null },
            { startDate: null, endDate: { gte: now } },
          ],
        },
        ...(locationId
          ? [{ OR: [{ locationId: null }, { locationId }] }]
          : []),
      ],
    };
    const offers = await prisma.offer.findMany({
      where: offerWhere,
    });

    res.json({ dishes, offers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

// Manager: get all dishes (including unavailable), optional ?locationId=
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const locationId = req.query.locationId as string | undefined;
    const dishes = await prisma.dish.findMany({
      where: locationId ? { locationId } : undefined,
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    res.json(dishes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dishes" });
  }
});

// Manager: create dish
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, locationId } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: "Name and price required" });
    }
    let locId = locationId;
    if (!locId) {
      const first = await prisma.location.findFirst({ orderBy: { name: "asc" } });
      locId = first?.id;
    }
    if (!locId) {
      return res.status(400).json({ error: "No location available" });
    }

    const dish = await prisma.dish.create({
      data: {
        locationId: locId,
        name,
        description: description || null,
        price: parseFloat(price),
        imageUrl: imageUrl || null,
        category: category || "Other",
      },
    });
    res.status(201).json(dish);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create dish" });
  }
});

// Manager: update dish
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, description, price, imageUrl, category, isAvailable } =
      req.body;

    const dish = await prisma.dish.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(category !== undefined && { category }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
    });
    res.json(dish);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update dish" });
  }
});

// Manager: delete dish
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.dish.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete dish" });
  }
});

export default router;
