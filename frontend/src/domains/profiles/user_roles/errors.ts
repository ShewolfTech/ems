/**
 * Auto-generated error classes for UserRoles
 */

export class UserRolesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserRolesValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserRolesValidationError);
    }
  }
}

export class UserRolesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserRolesServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserRolesServiceError);
    }
  }
}
