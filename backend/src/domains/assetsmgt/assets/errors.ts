/**
 * Custom Errors for Assets
 * Auto-generated domain error classes
 */
export class AssetsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AssetsError";
  }
}

export class AssetsNotFoundError extends AssetsError {
  constructor(id?: string | number) {
    super("Assets record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AssetsValidationError extends AssetsError {
  constructor(message?: string) {
    super(message || "Assets validation failed", 400);
  }
}

export class AssetsUnauthorizedError extends AssetsError {
  constructor() {
    super("Unauthorized to perform this action on Assets", 403);
  }
}

export class AssetsConflictError extends AssetsError {
  constructor(message: string = "Assets conflict") {
    super(message, 409);
  }
}

export class AssetsForbiddenError extends AssetsError {
  constructor() {
    super("Forbidden: insufficient rights for Assets", 403);
  }
}
