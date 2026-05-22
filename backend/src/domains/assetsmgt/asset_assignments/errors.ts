/**
 * Custom Errors for AssetAssignments
 * Auto-generated domain error classes
 */
export class AssetAssignmentsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AssetAssignmentsError";
  }
}

export class AssetAssignmentsNotFoundError extends AssetAssignmentsError {
  constructor(id?: string | number) {
    super("AssetAssignments record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AssetAssignmentsValidationError extends AssetAssignmentsError {
  constructor(message?: string) {
    super(message || "AssetAssignments validation failed", 400);
  }
}

export class AssetAssignmentsUnauthorizedError extends AssetAssignmentsError {
  constructor() {
    super("Unauthorized to perform this action on AssetAssignments", 403);
  }
}

export class AssetAssignmentsConflictError extends AssetAssignmentsError {
  constructor(message: string = "AssetAssignments conflict") {
    super(message, 409);
  }
}

export class AssetAssignmentsForbiddenError extends AssetAssignmentsError {
  constructor() {
    super("Forbidden: insufficient rights for AssetAssignments", 403);
  }
}
