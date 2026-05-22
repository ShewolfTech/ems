// -- a/file:///c%3A/Bright/ems/backend/src/config/infra/rateLimit.ts

// src/config/infra/rateLimit.ts
import rateLimit from 'express-rate-limit';
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

