/**
 * Auto-generated error classes for AssetAssignments
 */

export class AssetAssignmentsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssetAssignmentsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssetAssignmentsValidationError);
    }
  }
}

export class AssetAssignmentsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssetAssignmentsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssetAssignmentsServiceError);
    }
  }
}
