/**
 * Custom Errors for ContactTypes
 * Auto-generated domain error classes
 */
export class ContactTypesError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "ContactTypesError";
  }
}

export class ContactTypesNotFoundError extends ContactTypesError {
  constructor(id?: string | number) {
    super("ContactTypes record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class ContactTypesValidationError extends ContactTypesError {
  constructor(message?: string) {
    super(message || "ContactTypes validation failed", 400);
  }
}

export class ContactTypesUnauthorizedError extends ContactTypesError {
  constructor() {
    super("Unauthorized to perform this action on ContactTypes", 403);
  }
}

export class ContactTypesConflictError extends ContactTypesError {
  constructor(message: string = "ContactTypes conflict") {
    super(message, 409);
  }
}

export class ContactTypesForbiddenError extends ContactTypesError {
  constructor() {
    super("Forbidden: insufficient rights for ContactTypes", 403);
  }
}
