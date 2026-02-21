import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import authRoutes from "./routes/auth";
import menuRoutes from "./routes/menu";
import ordersRoutes from "./routes/orders";
import bannersRoutes from "./routes/banners";
import offersRoutes from "./routes/offers";
import tablesRoutes from "./routes/tables";
import paymentsRoutes from "./routes/payments";
import { initSocket } from "./socket";

const app = express();
const httpServer = createServer(app);

initSocket(httpServer);

const allowedOrigins: string[] = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((u) => u.trim()) : []),
];

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/dishes", menuRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/banners", bannersRoutes);
app.use("/api/offers", offersRoutes);
app.use("/api/tables", tablesRoutes);
app.use("/api/payments", paymentsRoutes);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
