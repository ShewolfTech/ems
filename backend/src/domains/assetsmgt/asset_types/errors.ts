/**
 * Custom Errors for AssetTypes
 * Auto-generated domain error classes
 */
export class AssetTypesError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AssetTypesError";
  }
}

export class AssetTypesNotFoundError extends AssetTypesError {
  constructor(id?: string | number) {
    super("AssetTypes record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AssetTypesValidationError extends AssetTypesError {
  constructor(message?: string) {
    super(message || "AssetTypes validation failed", 400);
  }
}

export class AssetTypesUnauthorizedError extends AssetTypesError {
  constructor() {
    super("Unauthorized to perform this action on AssetTypes", 403);
  }
}

export class AssetTypesConflictError extends AssetTypesError {
  constructor(message: string = "AssetTypes conflict") {
    super(message, 409);
  }
}

export class AssetTypesForbiddenError extends AssetTypesError {
  constructor() {
    super("Forbidden: insufficient rights for AssetTypes", 403);
  }
}
