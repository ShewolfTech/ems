/**
 * Custom Errors for StaffmgtRoles
 * Auto-generated domain error classes
 */
export class StaffmgtRolesError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "StaffmgtRolesError";
  }
}

export class StaffmgtRolesNotFoundError extends StaffmgtRolesError {
  constructor(id?: string | number) {
    super("StaffmgtRoles record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class StaffmgtRolesValidationError extends StaffmgtRolesError {
  constructor(message?: string) {
    super(message || "StaffmgtRoles validation failed", 400);
  }
}

export class StaffmgtRolesUnauthorizedError extends StaffmgtRolesError {
  constructor() {
    super("Unauthorized to perform this action on StaffmgtRoles", 403);
  }
}

export class StaffmgtRolesConflictError extends StaffmgtRolesError {
  constructor(message: string = "StaffmgtRoles conflict") {
    super(message, 409);
  }
}

export class StaffmgtRolesForbiddenError extends StaffmgtRolesError {
  constructor() {
    super("Forbidden: insufficient rights for StaffmgtRoles", 403);
  }
}
