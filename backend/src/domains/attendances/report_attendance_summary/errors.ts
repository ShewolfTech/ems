/**
 * Custom Errors for ReportAttendanceSummary
 * Auto-generated domain error classes
 */
export class ReportAttendanceSummaryError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "ReportAttendanceSummaryError";
  }
}

export class ReportAttendanceSummaryNotFoundError extends ReportAttendanceSummaryError {
  constructor(id?: string | number) {
    super("ReportAttendanceSummary record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class ReportAttendanceSummaryValidationError extends ReportAttendanceSummaryError {
  constructor(message?: string) {
    super(message || "ReportAttendanceSummary validation failed", 400);
  }
}

export class ReportAttendanceSummaryUnauthorizedError extends ReportAttendanceSummaryError {
  constructor() {
    super("Unauthorized to perform this action on ReportAttendanceSummary", 403);
  }
}

export class ReportAttendanceSummaryConflictError extends ReportAttendanceSummaryError {
  constructor(message: string = "ReportAttendanceSummary conflict") {
    super(message, 409);
  }
}

export class ReportAttendanceSummaryForbiddenError extends ReportAttendanceSummaryError {
  constructor() {
    super("Forbidden: insufficient rights for ReportAttendanceSummary", 403);
  }
}
