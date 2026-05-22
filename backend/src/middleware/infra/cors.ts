// backend/src/middleware/infra/cors.ts

import cors from "cors";

export const corsMiddleware = cors({
  origin: "*", // adjust for production
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
