/**
 * Custom Errors for Secrets
 * Auto-generated domain error classes
 */
export class SecretsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "SecretsError";
  }
}

export class SecretsNotFoundError extends SecretsError {
  constructor(id?: string | number) {
    super("Secrets record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class SecretsValidationError extends SecretsError {
  constructor(message?: string) {
    super(message || "Secrets validation failed", 400);
  }
}

export class SecretsUnauthorizedError extends SecretsError {
  constructor() {
    super("Unauthorized to perform this action on Secrets", 403);
  }
}

export class SecretsConflictError extends SecretsError {
  constructor(message: string = "Secrets conflict") {
    super(message, 409);
  }
}

export class SecretsForbiddenError extends SecretsError {
  constructor() {
    super("Forbidden: insufficient rights for Secrets", 403);
  }
}
