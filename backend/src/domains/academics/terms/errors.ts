/**
 * Custom Errors for Terms
 * Auto-generated domain error classes
 */
export class TermsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "TermsError";
  }
}

export class TermsNotFoundError extends TermsError {
  constructor(id?: string | number) {
    super("Terms record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class TermsValidationError extends TermsError {
  constructor(message?: string) {
    super(message || "Terms validation failed", 400);
  }
}

export class TermsUnauthorizedError extends TermsError {
  constructor() {
    super("Unauthorized to perform this action on Terms", 403);
  }
}

export class TermsConflictError extends TermsError {
  constructor(message: string = "Terms conflict") {
    super(message, 409);
  }
}

export class TermsForbiddenError extends TermsError {
  constructor() {
    super("Forbidden: insufficient rights for Terms", 403);
  }
}
