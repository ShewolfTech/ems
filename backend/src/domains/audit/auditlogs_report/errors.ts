/**
 * Custom Errors for AuditlogsReport
 * Auto-generated domain error classes
 */
export class AuditlogsReportError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AuditlogsReportError";
  }
}

export class AuditlogsReportNotFoundError extends AuditlogsReportError {
  constructor(id?: string | number) {
    super("AuditlogsReport record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AuditlogsReportValidationError extends AuditlogsReportError {
  constructor(message?: string) {
    super(message || "AuditlogsReport validation failed", 400);
  }
}

export class AuditlogsReportUnauthorizedError extends AuditlogsReportError {
  constructor() {
    super("Unauthorized to perform this action on AuditlogsReport", 403);
  }
}

export class AuditlogsReportConflictError extends AuditlogsReportError {
  constructor(message: string = "AuditlogsReport conflict") {
    super(message, 409);
  }
}

export class AuditlogsReportForbiddenError extends AuditlogsReportError {
  constructor() {
    super("Forbidden: insufficient rights for AuditlogsReport", 403);
  }
}
