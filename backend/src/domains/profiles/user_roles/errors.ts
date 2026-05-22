/**
 * Custom Errors for UserRoles
 * Auto-generated domain error classes
 */
export class UserRolesError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "UserRolesError";
  }
}

export class UserRolesNotFoundError extends UserRolesError {
  constructor(id?: string | number) {
    super("UserRoles record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class UserRolesValidationError extends UserRolesError {
  constructor(message?: string) {
    super(message || "UserRoles validation failed", 400);
  }
}

export class UserRolesUnauthorizedError extends UserRolesError {
  constructor() {
    super("Unauthorized to perform this action on UserRoles", 403);
  }
}

export class UserRolesConflictError extends UserRolesError {
  constructor(message: string = "UserRoles conflict") {
    super(message, 409);
  }
}

export class UserRolesForbiddenError extends UserRolesError {
  constructor() {
    super("Forbidden: insufficient rights for UserRoles", 403);
  }
}
