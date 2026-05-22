export class PermissionsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "PermissionsError";
  }
}

export class PermissionsNotFoundError extends PermissionsError {
  constructor(id?: string) {
    super("Permission record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class PermissionsValidationError extends PermissionsError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class PermissionsUnauthorizedError extends PermissionsError {
  constructor() {
    super("Unauthorized to perform this action on Permissions", 401);
  }
}

export class PermissionsForbiddenError extends PermissionsError {
  constructor() {
    super("Forbidden: insufficient rights for Permissions", 403);
  }
}

export class PermissionsConflictError extends PermissionsError {
  constructor(message: string = "Permissions conflict") {
    super(message, 409);
  }
}