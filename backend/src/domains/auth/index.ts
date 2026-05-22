// backend/src/domains/auth/index.ts
export * from "./types.js";
export * from "./validator.js";
export * from "./errors.js";
export * from "./service.js";
export * from "./controller.js";
export * from "./authMiddleware.js";
export { authRoutes } from "./routes.js";
export { authRoutes as default } from "./routes.js";