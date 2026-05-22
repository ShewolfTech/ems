/**
 * Custom Errors for Users
 * Auto-generated domain error classes
 */
export class UsersError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "UsersError";
  }
}

export class UsersNotFoundError extends UsersError {
  constructor(id?: string | number) {
    super("Users record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class UsersValidationError extends UsersError {
  constructor(message?: string) {
    super(message || "Users validation failed", 400);
  }
}

export class UsersUnauthorizedError extends UsersError {
  constructor() {
    super("Unauthorized to perform this action on Users", 403);
  }
}

export class UsersConflictError extends UsersError {
  constructor(message: string = "Users conflict") {
    super(message, 409);
  }
}

export class UsersForbiddenError extends UsersError {
  constructor() {
    super("Forbidden: insufficient rights for Users", 403);
  }
}
