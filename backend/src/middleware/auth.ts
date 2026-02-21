import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "cafe-management-secret-key";

export interface AuthRequest extends Request {
  managerId?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { managerId: string };
    req.managerId = decoded.managerId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
