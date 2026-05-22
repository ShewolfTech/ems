// backend/src/middleware/infra/rateLimiter.ts

import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP (increased from 100 to support dashboard activity)
  message: "Too many requests, please try again later.",
});
