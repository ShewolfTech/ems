/**
 * Auto-generated error classes for AssetTypes
 */

export class AssetTypesValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssetTypesValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssetTypesValidationError);
    }
  }
}

export class AssetTypesServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssetTypesServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssetTypesServiceError);
    }
  }
}
