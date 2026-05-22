/**
 * Auto-generated error classes for Timetables
 */

export class TimetablesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimetablesValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TimetablesValidationError);
    }
  }
}

export class TimetablesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimetablesServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TimetablesServiceError);
    }
  }
}
