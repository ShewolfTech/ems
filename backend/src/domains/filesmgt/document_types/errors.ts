/**
 * Custom Errors for DocumentTypes
 * Auto-generated domain error classes
 */
export class DocumentTypesError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "DocumentTypesError";
  }
}

export class DocumentTypesNotFoundError extends DocumentTypesError {
  constructor(id?: string | number) {
    super("DocumentTypes record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class DocumentTypesValidationError extends DocumentTypesError {
  constructor(message?: string) {
    super(message || "DocumentTypes validation failed", 400);
  }
}

export class DocumentTypesUnauthorizedError extends DocumentTypesError {
  constructor() {
    super("Unauthorized to perform this action on DocumentTypes", 403);
  }
}

export class DocumentTypesConflictError extends DocumentTypesError {
  constructor(message: string = "DocumentTypes conflict") {
    super(message, 409);
  }
}

export class DocumentTypesForbiddenError extends DocumentTypesError {
  constructor() {
    super("Forbidden: insufficient rights for DocumentTypes", 403);
  }
}
