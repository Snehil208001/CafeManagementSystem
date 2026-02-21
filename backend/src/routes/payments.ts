import { Router } from "express";
import prisma from "../db";
import { authMiddleware } from "../middleware/auth";
import { getIO } from "../socket";

const router = Router();

// Customer: create payment (public - after order is completed)
router.post("/", async (req, res) => {
  try {
    const { orderId, amount, method } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ error: "Order ID and amount required" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { table: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "completed") {
      return res.status(400).json({ error: "Order must be completed before payment" });
    }

    const items = order.items as { name: string; price: number; quantity: number }[];
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    if (Math.abs(amount - total) > 0.01) {
      return res.status(400).json({ error: `Amount must be ₹${total.toFixed(0)}` });
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        method: method || "cash",
        status: "completed",
        billSent: true,
      },
      include: { order: { include: { table: true } } },
    });

    const io = getIO();
    if (io) {
      io.emit("payment:new", payment);
    }

    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment failed" });
  }
});

// Manager: get all payments (payment history)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        order: { include: { table: true } },
      },
      orderBy: { paidAt: "desc" },
      take: 200,
    });
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// Public: get bill/receipt for order (customer view after payment)
router.get("/receipt/:orderId", async (req, res) => {
  try {
    const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { table: true, payments: true },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const hasPayment = order.payments.length > 0;
    if (!hasPayment) {
      return res.status(400).json({ error: "No payment found for this order" });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch receipt" });
  }
});

export default router;
