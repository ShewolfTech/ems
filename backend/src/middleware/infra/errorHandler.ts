// backend/src/middleware/infra/errorHandler.ts
import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Always log to the terminal for the developer
  console.error("🔥🔥🔥 BACKEND ERROR 🔥🔥🔥");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",
    // ✅ Include stack trace in dev mode so you can see the culprit in Axios response
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
    traceId: (req as any).traceId,
  });
}