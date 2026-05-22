// backend/src/server/server.ts
import express from "express";
import { mountRoutes, domainRegistry } from "./mountRoutes.js";
import { DomainRegistry } from "../registry/index.js"; // import your auto-generated registry
import { errorHandler } from "../middleware/infra/errorHandler.js";
import { corsMiddleware } from "../middleware/infra/cors.js";
import { requestTracer } from "../middleware/infra/requestTracer.js";
import { logging } from "../middleware/infra/logging.js";
import { rateLimiter } from "../middleware/infra/rateLimiter.js";
import { authenticate } from "../middleware/security/authenticate.js";
import { setUserContext } from "../middleware/context/setUserContext.js";
import { hydratePermissions } from "../middleware/security/hydratePermissions.js";

const app = express();

app.use(express.json());
app.use(corsMiddleware);

// Apply infrastructure middleware to all routes
app.use(requestTracer, logging, rateLimiter);

// Protected API routes - apply auth middleware but skip for auth routes
app.use("/api", (req, res, next) => {
  // Skip auth for /api/auth paths (login, register, etc.)
  if (req.path.startsWith("/auth")) {
    return next();
  }
  // For all other routes, apply auth middleware
  authenticate(req, res, next);
});

// Apply user context and permissions hydration to all /api routes
app.use("/api", setUserContext, hydratePermissions);

export async function initializeApp() {
  await mountRoutes(app);

  // Root /api handler
  app.get("/api", (req, res) => {
    res.json({
      message: "EMS API Registry is alive",
      mounted_routes: domainRegistry,
      schemas: Object.keys(DomainRegistry)
    });
  });

  app.use(errorHandler);
  return app;
}

export default app;
