/**
 * Auto-generated error classes for Roles
 */

export class RolesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RolesValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RolesValidationError);
    }
  }
}

export class RolesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RolesServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RolesServiceError);
    }
  }
}
