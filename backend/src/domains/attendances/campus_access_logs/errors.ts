/**
 * Custom Errors for CampusAccessLogs
 * Auto-generated domain error classes
 */
export class CampusAccessLogsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "CampusAccessLogsError";
  }
}

export class CampusAccessLogsNotFoundError extends CampusAccessLogsError {
  constructor(id?: string | number) {
    super("CampusAccessLogs record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class CampusAccessLogsValidationError extends CampusAccessLogsError {
  constructor(message?: string) {
    super(message || "CampusAccessLogs validation failed", 400);
  }
}

export class CampusAccessLogsUnauthorizedError extends CampusAccessLogsError {
  constructor() {
    super("Unauthorized to perform this action on CampusAccessLogs", 403);
  }
}

export class CampusAccessLogsConflictError extends CampusAccessLogsError {
  constructor(message: string = "CampusAccessLogs conflict") {
    super(message, 409);
  }
}

export class CampusAccessLogsForbiddenError extends CampusAccessLogsError {
  constructor() {
    super("Forbidden: insufficient rights for CampusAccessLogs", 403);
  }
}
