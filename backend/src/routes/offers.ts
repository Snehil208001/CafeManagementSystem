import { Router } from "express";
import prisma from "../db";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Public: get active offers (included in menu route)
// Manager: get all offers
router.get("/", authMiddleware, async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch offers" });
  }
});

// Manager: create offer
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      discountType,
      discountValue,
      applicableDishIds,
      startDate,
      endDate,
    } = req.body;

    if (!title || !discountType || discountValue === undefined) {
      return res.status(400).json({
        error: "Title, discountType, and discountValue required",
      });
    }

    if (!["percentage", "fixed"].includes(discountType)) {
      return res.status(400).json({
        error: "discountType must be 'percentage' or 'fixed'",
      });
    }

    const offer = await prisma.offer.create({
      data: {
        title,
        description: description || null,
        discountType,
        discountValue: parseFloat(discountValue),
        applicableDishIds: Array.isArray(applicableDishIds)
          ? applicableDishIds
          : [],
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    res.status(201).json(offer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create offer" });
  }
});

// Manager: update offer
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const {
      title,
      description,
      discountType,
      discountValue,
      applicableDishIds,
      isActive,
      startDate,
      endDate,
    } = req.body;

    const offer = await prisma.offer.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(discountType !== undefined && { discountType }),
        ...(discountValue !== undefined && {
          discountValue: parseFloat(discountValue),
        }),
        ...(applicableDishIds !== undefined && {
          applicableDishIds: Array.isArray(applicableDishIds)
            ? applicableDishIds
            : [],
        }),
        ...(isActive !== undefined && { isActive }),
        ...(startDate !== undefined && {
          startDate: startDate ? new Date(startDate) : null,
        }),
        ...(endDate !== undefined && {
          endDate: endDate ? new Date(endDate) : null,
        }),
      },
    });
    res.json(offer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update offer" });
  }
});

// Manager: delete offer
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.offer.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete offer" });
  }
});

export default router;
