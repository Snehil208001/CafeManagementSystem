import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "cafe-management-secret-key";

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const manager = await prisma.manager.findUnique({ where: { email } });
    if (!manager) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, manager.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { managerId: manager.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      manager: { id: manager.id, email: manager.email, name: manager.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
