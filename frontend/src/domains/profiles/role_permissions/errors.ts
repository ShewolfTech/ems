/**
 * Auto-generated error classes for RolePermissions
 */

export class RolePermissionsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RolePermissionsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RolePermissionsValidationError);
    }
  }
}

export class RolePermissionsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RolePermissionsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RolePermissionsServiceError);
    }
  }
}
