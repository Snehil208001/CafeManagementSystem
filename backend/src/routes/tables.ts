import { Router } from "express";
import prisma from "../db";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Manager: get all tables
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tables = await prisma.cafeTable.findMany({
      include: {
        orders: {
          where: { status: { not: "completed" } },
        },
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
    const { count } = req.body;
    const num = count || 10;

    const existing = await prisma.cafeTable.findMany();
    const maxNum = existing.length
      ? Math.max(...existing.map((t) => t.tableNumber))
      : 0;

    const tables = [];
    for (let i = 1; i <= num; i++) {
      const tableNumber = maxNum + i;
      const table = await prisma.cafeTable.create({
        data: {
          tableNumber,
          qrCodeUrl: `/order?table=${tableNumber}`,
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
