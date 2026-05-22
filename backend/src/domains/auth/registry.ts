// backend/src/domains/auth/registry/registry.ts

/**
 * Auth Domain Registry
 * --------------------
 * Centralized exports for the Auth domain.
 * This makes onboarding and audit easier by exposing a predictable API surface.
 */

import * as Models from "./models.js";
import * as Types from "./types.js";
import * as Service from "./service.js";
import * as Controller from "./controller.js";
import * as Routes from "./routes.js";
import * as Middleware from "./authMiddleware.js";
import * as Validator from "./validator.js";
import * as Errors from "./errors.js";

export const AuthRegistry = {
  models: Models,
  types: Types,
  service: Service,
  controller: Controller,
  routes: Routes,
  middleware: Middleware,
  validator: Validator,
  errors: Errors,
};

// Named exports for convenience
export {
  Models,
  Types,
  Service,
  Controller,
  Routes,
  Middleware,
  Validator,
  Errors,
};
