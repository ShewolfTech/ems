/**
 * Custom Errors for UserPermissions
 * Auto-generated domain error classes
 */
export class UserPermissionsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "UserPermissionsError";
  }
}

export class UserPermissionsNotFoundError extends UserPermissionsError {
  constructor(id?: string | number) {
    super("UserPermissions record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class UserPermissionsValidationError extends UserPermissionsError {
  constructor(message?: string) {
    super(message || "UserPermissions validation failed", 400);
  }
}

export class UserPermissionsUnauthorizedError extends UserPermissionsError {
  constructor() {
    super("Unauthorized to perform this action on UserPermissions", 403);
  }
}

export class UserPermissionsConflictError extends UserPermissionsError {
  constructor(message: string = "UserPermissions conflict") {
    super(message, 409);
  }
}

export class UserPermissionsForbiddenError extends UserPermissionsError {
  constructor() {
    super("Forbidden: insufficient rights for UserPermissions", 403);
  }
}
