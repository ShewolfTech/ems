/**
 * Custom Errors for RoutePermissions
 * Auto-generated domain error classes
 */
export class RoutePermissionsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "RoutePermissionsError";
  }
}

export class RoutePermissionsNotFoundError extends RoutePermissionsError {
  constructor(id?: string | number) {
    super("RoutePermissions record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class RoutePermissionsValidationError extends RoutePermissionsError {
  constructor(message?: string) {
    super(message || "RoutePermissions validation failed", 400);
  }
}

export class RoutePermissionsUnauthorizedError extends RoutePermissionsError {
  constructor() {
    super("Unauthorized to perform this action on RoutePermissions", 403);
  }
}

export class RoutePermissionsConflictError extends RoutePermissionsError {
  constructor(message: string = "RoutePermissions conflict") {
    super(message, 409);
  }
}

export class RoutePermissionsForbiddenError extends RoutePermissionsError {
  constructor() {
    super("Forbidden: insufficient rights for RoutePermissions", 403);
  }
}
