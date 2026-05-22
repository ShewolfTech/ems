/**
 * Custom Errors for Genders
 * Auto-generated domain error classes
 */
export class GendersError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "GendersError";
  }
}

export class GendersNotFoundError extends GendersError {
  constructor(id?: string | number) {
    super("Genders record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class GendersValidationError extends GendersError {
  constructor(message?: string) {
    super(message || "Genders validation failed", 400);
  }
}

export class GendersUnauthorizedError extends GendersError {
  constructor() {
    super("Unauthorized to perform this action on Genders", 403);
  }
}

export class GendersConflictError extends GendersError {
  constructor(message: string = "Genders conflict") {
    super(message, 409);
  }
}

export class GendersForbiddenError extends GendersError {
  constructor() {
    super("Forbidden: insufficient rights for Genders", 403);
  }
}
