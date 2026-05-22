/**
 * Custom Errors for Buckets
 * Auto-generated domain error classes
 */
export class BucketsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "BucketsError";
  }
}

export class BucketsNotFoundError extends BucketsError {
  constructor(id?: string | number) {
    super("Buckets record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class BucketsValidationError extends BucketsError {
  constructor(message?: string) {
    super(message || "Buckets validation failed", 400);
  }
}

export class BucketsUnauthorizedError extends BucketsError {
  constructor() {
    super("Unauthorized to perform this action on Buckets", 403);
  }
}

export class BucketsConflictError extends BucketsError {
  constructor(message: string = "Buckets conflict") {
    super(message, 409);
  }
}

export class BucketsForbiddenError extends BucketsError {
  constructor() {
    super("Forbidden: insufficient rights for Buckets", 403);
  }
}
