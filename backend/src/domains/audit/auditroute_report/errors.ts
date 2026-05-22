/**
 * Custom Errors for AuditrouteReport
 * Auto-generated domain error classes
 */
export class AuditrouteReportError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AuditrouteReportError";
  }
}

export class AuditrouteReportNotFoundError extends AuditrouteReportError {
  constructor(id?: string | number) {
    super("AuditrouteReport record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AuditrouteReportValidationError extends AuditrouteReportError {
  constructor(message?: string) {
    super(message || "AuditrouteReport validation failed", 400);
  }
}

export class AuditrouteReportUnauthorizedError extends AuditrouteReportError {
  constructor() {
    super("Unauthorized to perform this action on AuditrouteReport", 403);
  }
}

export class AuditrouteReportConflictError extends AuditrouteReportError {
  constructor(message: string = "AuditrouteReport conflict") {
    super(message, 409);
  }
}

export class AuditrouteReportForbiddenError extends AuditrouteReportError {
  constructor() {
    super("Forbidden: insufficient rights for AuditrouteReport", 403);
  }
}
