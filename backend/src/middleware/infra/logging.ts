// backend/src/middleware/infra/logging.ts

import { Request, Response, NextFunction } from "express";

export function logging(req: Request, res: Response, next: NextFunction) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
}
