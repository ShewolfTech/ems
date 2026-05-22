/**
 * Auto-generated error classes for EducationLevels
 */

export class EducationLevelsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EducationLevelsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EducationLevelsValidationError);
    }
  }
}

export class EducationLevelsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EducationLevelsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EducationLevelsServiceError);
    }
  }
}
