/**
 * Auto-generated error classes for Integrations
 */

export class IntegrationsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IntegrationsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IntegrationsValidationError);
    }
  }
}

export class IntegrationsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IntegrationsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IntegrationsServiceError);
    }
  }
}
