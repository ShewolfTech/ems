/**
 * Custom Errors for CustomFields
 * Auto-generated domain error classes
 */
export class CustomFieldsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "CustomFieldsError";
  }
}

export class CustomFieldsNotFoundError extends CustomFieldsError {
  constructor(id?: string | number) {
    super("CustomFields record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class CustomFieldsValidationError extends CustomFieldsError {
  constructor(message?: string) {
    super(message || "CustomFields validation failed", 400);
  }
}

export class CustomFieldsUnauthorizedError extends CustomFieldsError {
  constructor() {
    super("Unauthorized to perform this action on CustomFields", 403);
  }
}

export class CustomFieldsConflictError extends CustomFieldsError {
  constructor(message: string = "CustomFields conflict") {
    super(message, 409);
  }
}

export class CustomFieldsForbiddenError extends CustomFieldsError {
  constructor() {
    super("Forbidden: insufficient rights for CustomFields", 403);
  }
}
