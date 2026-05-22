/**
 * Custom Errors for RolePermissions
 * Auto-generated domain error classes
 */
export class RolePermissionsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "RolePermissionsError";
  }
}

export class RolePermissionsNotFoundError extends RolePermissionsError {
  constructor(id?: string | number) {
    super("RolePermissions record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class RolePermissionsValidationError extends RolePermissionsError {
  constructor(message?: string) {
    super(message || "RolePermissions validation failed", 400);
  }
}

export class RolePermissionsUnauthorizedError extends RolePermissionsError {
  constructor() {
    super("Unauthorized to perform this action on RolePermissions", 403);
  }
}

export class RolePermissionsConflictError extends RolePermissionsError {
  constructor(message: string = "RolePermissions conflict") {
    super(message, 409);
  }
}

export class RolePermissionsForbiddenError extends RolePermissionsError {
  constructor() {
    super("Forbidden: insufficient rights for RolePermissions", 403);
  }
}
