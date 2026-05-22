// backend/src/middleware/infra/requestTracer.ts

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function requestTracer(req: Request, res: Response, next: NextFunction) {
  (req as any).traceId = crypto.randomUUID();
  res.setHeader("X-Trace-Id", (req as any).traceId);
  next();
}
