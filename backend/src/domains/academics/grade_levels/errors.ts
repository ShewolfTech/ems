/**
 * Custom Errors for GradeLevels
 * Auto-generated domain error classes
 */
export class GradeLevelsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "GradeLevelsError";
  }
}

export class GradeLevelsNotFoundError extends GradeLevelsError {
  constructor(id?: string | number) {
    super("GradeLevels record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class GradeLevelsValidationError extends GradeLevelsError {
  constructor(message?: string) {
    super(message || "GradeLevels validation failed", 400);
  }
}

export class GradeLevelsUnauthorizedError extends GradeLevelsError {
  constructor() {
    super("Unauthorized to perform this action on GradeLevels", 403);
  }
}

export class GradeLevelsConflictError extends GradeLevelsError {
  constructor(message: string = "GradeLevels conflict") {
    super(message, 409);
  }
}

export class GradeLevelsForbiddenError extends GradeLevelsError {
  constructor() {
    super("Forbidden: insufficient rights for GradeLevels", 403);
  }
}
