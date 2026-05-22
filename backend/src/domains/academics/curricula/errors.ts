/**
 * Custom Errors for Curricula
 * Auto-generated domain error classes
 */
export class CurriculaError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "CurriculaError";
  }
}

export class CurriculaNotFoundError extends CurriculaError {
  constructor(id?: string | number) {
    super("Curricula record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class CurriculaValidationError extends CurriculaError {
  constructor(message?: string) {
    super(message || "Curricula validation failed", 400);
  }
}

export class CurriculaUnauthorizedError extends CurriculaError {
  constructor() {
    super("Unauthorized to perform this action on Curricula", 403);
  }
}

export class CurriculaConflictError extends CurriculaError {
  constructor(message: string = "Curricula conflict") {
    super(message, 409);
  }
}

export class CurriculaForbiddenError extends CurriculaError {
  constructor() {
    super("Forbidden: insufficient rights for Curricula", 403);
  }
}
