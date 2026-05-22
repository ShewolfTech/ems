/**
 * Auto-generated error classes for AuditlogsReport
 */

export class AuditlogsReportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuditlogsReportValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuditlogsReportValidationError);
    }
  }
}

export class AuditlogsReportServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuditlogsReportServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuditlogsReportServiceError);
    }
  }
}
