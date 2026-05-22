/**
 * Custom Errors for Roles
 * Auto-generated domain error classes
 */
export class RolesError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "RolesError";
  }
}

export class RolesNotFoundError extends RolesError {
  constructor(id?: string | number) {
    super("Roles record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class RolesValidationError extends RolesError {
  constructor(message?: string) {
    super(message || "Roles validation failed", 400);
  }
}

export class RolesUnauthorizedError extends RolesError {
  constructor() {
    super("Unauthorized to perform this action on Roles", 403);
  }
}

export class RolesConflictError extends RolesError {
  constructor(message: string = "Roles conflict") {
    super(message, 409);
  }
}

export class RolesForbiddenError extends RolesError {
  constructor() {
    super("Forbidden: insufficient rights for Roles", 403);
  }
}
