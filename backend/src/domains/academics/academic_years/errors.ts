/**
 * Custom Errors for AcademicYears
 * Auto-generated domain error classes
 */
export class AcademicYearsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AcademicYearsError";
  }
}

export class AcademicYearsNotFoundError extends AcademicYearsError {
  constructor(id?: string | number) {
    super("AcademicYears record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AcademicYearsValidationError extends AcademicYearsError {
  constructor(message?: string) {
    super(message || "AcademicYears validation failed", 400);
  }
}

export class AcademicYearsUnauthorizedError extends AcademicYearsError {
  constructor() {
    super("Unauthorized to perform this action on AcademicYears", 403);
  }
}

export class AcademicYearsConflictError extends AcademicYearsError {
  constructor(message: string = "AcademicYears conflict") {
    super(message, 409);
  }
}

export class AcademicYearsForbiddenError extends AcademicYearsError {
  constructor() {
    super("Forbidden: insufficient rights for AcademicYears", 403);
  }
}
