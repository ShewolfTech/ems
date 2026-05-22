/**
 * Auto-generated error classes for RoutePermissions
 */

export class RoutePermissionsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoutePermissionsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RoutePermissionsValidationError);
    }
  }
}

export class RoutePermissionsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoutePermissionsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RoutePermissionsServiceError);
    }
  }
}
