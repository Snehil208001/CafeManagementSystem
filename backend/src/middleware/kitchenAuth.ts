import { Request, Response, NextFunction } from "express";

const KITCHEN_TOKEN = process.env.KITCHEN_TOKEN;

export function kitchenAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!KITCHEN_TOKEN) {
    return next();
  }
  const token = req.headers["x-kitchen-token"] as string | undefined;
  if (token !== KITCHEN_TOKEN) {
    return res.status(401).json({ error: "Invalid kitchen token" });
  }
  next();
}
