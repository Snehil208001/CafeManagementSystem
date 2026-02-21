import { Router } from "express";
import prisma from "../db";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

// Popular dishes - aggregate from order items
router.get("/popular-dishes", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: "completed" },
      select: { items: true },
    });

    const dishCounts: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const order of orders) {
      const items = order.items as { name: string; quantity: number; price: number }[];
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        const key = item.name;
        if (!dishCounts[key]) {
          dishCounts[key] = { name: key, quantity: 0, revenue: 0 };
        }
        dishCounts[key].quantity += item.quantity;
        dishCounts[key].revenue += item.price * item.quantity;
      }
    }
    const popular = Object.values(dishCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 15);
    res.json(popular);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch popular dishes" });
  }
});

// Peak hours - orders by hour of day
router.get("/peak-hours", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: "completed" },
      select: { createdAt: true },
    });

    const byHour: Record<number, number> = {};
    for (let h = 0; h < 24; h++) byHour[h] = 0;
    for (const o of orders) {
      const h = new Date(o.createdAt).getHours();
      byHour[h]++;
    }
    const peakHours = Object.entries(byHour).map(([hour, count]) => ({
      hour: parseInt(hour, 10),
      label: `${hour.toString().padStart(2, "0")}:00`,
      orderCount: count,
    }));
    res.json(peakHours);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch peak hours" });
  }
});

// Summary stats
router.get("/summary", async (req, res) => {
  try {
    const [totalOrders, completedOrders, totalRevenue] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "completed" } }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
    ]);
    res.json({
      totalOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.amount ?? 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

export default router;
