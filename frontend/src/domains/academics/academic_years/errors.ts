/**
 * Auto-generated error classes for AcademicYears
 */

export class AcademicYearsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AcademicYearsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AcademicYearsValidationError);
    }
  }
}

export class AcademicYearsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AcademicYearsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AcademicYearsServiceError);
    }
  }
}
