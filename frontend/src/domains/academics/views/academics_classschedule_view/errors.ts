/**
 * Auto-generated error classes for AcademicsClassscheduleView
 */

export class AcademicsClassscheduleViewValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AcademicsClassscheduleViewValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AcademicsClassscheduleViewValidationError);
    }
  }
}

export class AcademicsClassscheduleViewServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AcademicsClassscheduleViewServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AcademicsClassscheduleViewServiceError);
    }
  }
}
