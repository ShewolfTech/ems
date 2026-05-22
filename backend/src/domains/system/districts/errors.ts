/**
 * Custom Errors for Districts
 * Auto-generated domain error classes
 */
export class DistrictsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "DistrictsError";
  }
}

export class DistrictsNotFoundError extends DistrictsError {
  constructor(id?: string | number) {
    super("Districts record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class DistrictsValidationError extends DistrictsError {
  constructor(message?: string) {
    super(message || "Districts validation failed", 400);
  }
}

export class DistrictsUnauthorizedError extends DistrictsError {
  constructor() {
    super("Unauthorized to perform this action on Districts", 403);
  }
}

export class DistrictsConflictError extends DistrictsError {
  constructor(message: string = "Districts conflict") {
    super(message, 409);
  }
}

export class DistrictsForbiddenError extends DistrictsError {
  constructor() {
    super("Forbidden: insufficient rights for Districts", 403);
  }
}
