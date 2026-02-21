import { Router } from "express";
import prisma from "../db";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Manager: get all tables, optional ?locationId=
router.get("/", authMiddleware, async (req, res) => {
  try {
    const locationId = req.query.locationId as string | undefined;
    const tables = await prisma.cafeTable.findMany({
      where: locationId ? { locationId } : undefined,
      include: {
        orders: { where: { status: { not: "completed" } } },
      },
      orderBy: { tableNumber: "asc" },
    });
    res.json(tables);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tables" });
  }
});

// Manager: create tables (bulk)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { count, locationId } = req.body;
    const num = count || 10;
    let locId = locationId;
    if (!locId) {
      const first = await prisma.location.findFirst({ orderBy: { name: "asc" } });
      locId = first?.id;
    }
    if (!locId) {
      return res.status(400).json({ error: "No location available" });
    }

    const existing = await prisma.cafeTable.findMany({ where: { locationId: locId } });
    const maxNum = existing.length
      ? Math.max(...existing.map((t) => t.tableNumber))
      : 0;

    const tables = [];
    for (let i = 1; i <= num; i++) {
      const tableNumber = maxNum + i;
      const table = await prisma.cafeTable.create({
        data: {
          locationId: locId,
          tableNumber,
          qrCodeUrl: `/order?table=${tableNumber}&location=${locId}`,
        },
      });
      tables.push(table);
    }
    res.status(201).json(tables);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create tables" });
  }
});

export default router;
