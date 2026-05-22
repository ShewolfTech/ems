// backend/src/middleware/infra/errorHandler.ts

import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("[ERROR]", err);

  res.status(err.statusCode || err.status || 500).json({
    error: err.message || "Internal Server Error",
    traceId: (req as any).traceId, // correlate with requestTracer
  });
}
