/**
 * Custom Errors for AssetMaintenanceLogs
 * Auto-generated domain error classes
 */
export class AssetMaintenanceLogsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AssetMaintenanceLogsError";
  }
}

export class AssetMaintenanceLogsNotFoundError extends AssetMaintenanceLogsError {
  constructor(id?: string | number) {
    super("AssetMaintenanceLogs record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AssetMaintenanceLogsValidationError extends AssetMaintenanceLogsError {
  constructor(message?: string) {
    super(message || "AssetMaintenanceLogs validation failed", 400);
  }
}

export class AssetMaintenanceLogsUnauthorizedError extends AssetMaintenanceLogsError {
  constructor() {
    super("Unauthorized to perform this action on AssetMaintenanceLogs", 403);
  }
}

export class AssetMaintenanceLogsConflictError extends AssetMaintenanceLogsError {
  constructor(message: string = "AssetMaintenanceLogs conflict") {
    super(message, 409);
  }
}

export class AssetMaintenanceLogsForbiddenError extends AssetMaintenanceLogsError {
  constructor() {
    super("Forbidden: insufficient rights for AssetMaintenanceLogs", 403);
  }
}
