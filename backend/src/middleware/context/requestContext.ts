// 📁 backend/src/middleware/context/requestContext.ts

import { Request, Response, NextFunction } from "express";

export function requestContext(req: Request, res: Response, next: NextFunction) {
  (req as any).context = {
    requestId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  next();
}
