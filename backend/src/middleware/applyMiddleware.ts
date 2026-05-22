// backend/src/middleware/applyMiddleware.ts
import { Router } from "express";
import { requestTracer } from "./infra/requestTracer.js";
import { logging } from "./infra/logging.js";
import { corsMiddleware } from "./infra/cors.js";
import { rateLimiter } from "./infra/rateLimiter.js";
import { authenticate } from "./security/authenticate.js";
import { hydratePermissions } from "./security/hydratePermissions.js";
import { errorHandler } from "./infra/errorHandler.js";
import { requestContext } from "./context/requestContext.js";
import { setUserContext } from "./context/setUserContext.js";

export function applyMiddleware(router: Router) {
  // 🔹 Infra: tracing, logging, CORS, rate limiting
  router.use(requestTracer);
  router.use(logging);
  router.use(corsMiddleware);
  router.use(rateLimiter);

  // 🔹 Context injection
  router.use(requestContext);

  // 🔹 Security: authentication + user context + permissions
  router.use(authenticate);
  router.use(setUserContext);
  router.use(hydratePermissions);

  // 🔹 Error handling (always last)
  router.use(errorHandler);

  return router;
}
