/**
 * Custom Errors for EducationLevels
 * Auto-generated domain error classes
 */
export class EducationLevelsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "EducationLevelsError";
  }
}

export class EducationLevelsNotFoundError extends EducationLevelsError {
  constructor(id?: string | number) {
    super("EducationLevels record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class EducationLevelsValidationError extends EducationLevelsError {
  constructor(message?: string) {
    super(message || "EducationLevels validation failed", 400);
  }
}

export class EducationLevelsUnauthorizedError extends EducationLevelsError {
  constructor() {
    super("Unauthorized to perform this action on EducationLevels", 403);
  }
}

export class EducationLevelsConflictError extends EducationLevelsError {
  constructor(message: string = "EducationLevels conflict") {
    super(message, 409);
  }
}

export class EducationLevelsForbiddenError extends EducationLevelsError {
  constructor() {
    super("Forbidden: insufficient rights for EducationLevels", 403);
  }
}
