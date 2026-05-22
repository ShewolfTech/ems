/**
 * Auto-generated error classes for AssetMaintenanceLogs
 */

export class AssetMaintenanceLogsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssetMaintenanceLogsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssetMaintenanceLogsValidationError);
    }
  }
}

export class AssetMaintenanceLogsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssetMaintenanceLogsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssetMaintenanceLogsServiceError);
    }
  }
}
