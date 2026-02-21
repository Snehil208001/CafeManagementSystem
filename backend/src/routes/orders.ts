import { Router } from "express";
import rateLimit from "express-rate-limit";
import prisma from "../db";
import { authMiddleware } from "../middleware/auth";
import { getIO } from "../socket";

const router = Router();

const orderCreateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many orders, please try again later" },
});

// Create order (public - customer)
router.post("/", orderCreateLimiter, async (req, res) => {
  try {
    const { tableId, tableNumber, items } = req.body;

    let table;
    if (tableId) {
      table = await prisma.cafeTable.findUnique({ where: { id: tableId } });
    } else if (tableNumber !== undefined) {
      table = await prisma.cafeTable.findUnique({
        where: { tableNumber: parseInt(tableNumber) },
      });
    }

    if (!table) {
      return res.status(400).json({ error: "Invalid table" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must have at least one item" });
    }

    const order = await prisma.order.create({
      data: {
        tableId: table.id,
        items: items,
        status: "pending",
      },
      include: { table: true },
    });

    await prisma.cafeTable.update({
      where: { id: table.id },
      data: { status: "occupied" },
    });

    const io = getIO();
    if (io) {
      io.emit("order:new", order);
      io.emit(`order:table:${table.tableNumber}`, order);
    }

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Manager: get all active orders (must be before /table/:tableNumber)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { not: "completed" } },
      include: { table: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Manager: get all orders (including completed)
router.get("/manager", authMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { table: true, payments: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Get orders for a table (public - customer viewing their order)
router.get("/table/:tableNumber", async (req, res) => {
  try {
    const tableNumParam = Array.isArray(req.params.tableNumber) ? req.params.tableNumber[0] : req.params.tableNumber;
    const tableNumber = parseInt(tableNumParam || "0");
    const table = await prisma.cafeTable.findUnique({
      where: { tableNumber },
      include: {
        orders: {
          where: {
            status: { not: "completed" },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    res.json(table.orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Manager: update order status
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "preparing", "completed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Use: pending, confirmed, preparing, completed",
      });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { table: true },
    });

    if (status === "completed") {
      const activeOrders = await prisma.order.count({
        where: {
          tableId: order.tableId,
          status: { not: "completed" },
        },
      });
      if (activeOrders === 0) {
        await prisma.cafeTable.update({
          where: { id: order.tableId },
          data: { status: "available" },
        });
      }
    }

    const io = getIO();
    if (io) {
      io.emit("order:updated", order);
      const tableNum = (order as { table?: { tableNumber: number } }).table?.tableNumber;
      if (tableNum != null) io.emit(`order:table:${tableNum}`, order);
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
