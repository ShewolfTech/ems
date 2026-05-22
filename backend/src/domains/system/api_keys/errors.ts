/**
 * Custom Errors for ApiKeys
 * Auto-generated domain error classes
 */
export class ApiKeysError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "ApiKeysError";
  }
}

export class ApiKeysNotFoundError extends ApiKeysError {
  constructor(id?: string | number) {
    super("ApiKeys record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class ApiKeysValidationError extends ApiKeysError {
  constructor(message?: string) {
    super(message || "ApiKeys validation failed", 400);
  }
}

export class ApiKeysUnauthorizedError extends ApiKeysError {
  constructor() {
    super("Unauthorized to perform this action on ApiKeys", 403);
  }
}

export class ApiKeysConflictError extends ApiKeysError {
  constructor(message: string = "ApiKeys conflict") {
    super(message, 409);
  }
}

export class ApiKeysForbiddenError extends ApiKeysError {
  constructor() {
    super("Forbidden: insufficient rights for ApiKeys", 403);
  }
}
