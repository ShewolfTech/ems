/**
 * Custom Errors for EmploymentTypes
 * Auto-generated domain error classes
 */
export class EmploymentTypesError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "EmploymentTypesError";
  }
}

export class EmploymentTypesNotFoundError extends EmploymentTypesError {
  constructor(id?: string | number) {
    super("EmploymentTypes record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class EmploymentTypesValidationError extends EmploymentTypesError {
  constructor(message?: string) {
    super(message || "EmploymentTypes validation failed", 400);
  }
}

export class EmploymentTypesUnauthorizedError extends EmploymentTypesError {
  constructor() {
    super("Unauthorized to perform this action on EmploymentTypes", 403);
  }
}

export class EmploymentTypesConflictError extends EmploymentTypesError {
  constructor(message: string = "EmploymentTypes conflict") {
    super(message, 409);
  }
}

export class EmploymentTypesForbiddenError extends EmploymentTypesError {
  constructor() {
    super("Forbidden: insufficient rights for EmploymentTypes", 403);
  }
}
