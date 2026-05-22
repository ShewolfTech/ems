/**
 * Auto-generated error classes for UserPermissions
 */

export class UserPermissionsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserPermissionsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserPermissionsValidationError);
    }
  }
}

export class UserPermissionsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserPermissionsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UserPermissionsServiceError);
    }
  }
}
