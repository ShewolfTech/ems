/**
 * Auto-generated error classes for CampusAccessLogs
 */

export class CampusAccessLogsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CampusAccessLogsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CampusAccessLogsValidationError);
    }
  }
}

export class CampusAccessLogsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CampusAccessLogsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CampusAccessLogsServiceError);
    }
  }
}
