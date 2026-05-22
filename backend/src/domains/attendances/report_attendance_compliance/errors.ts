/**
 * Custom Errors for ReportAttendanceCompliance
 * Auto-generated domain error classes
 */
export class ReportAttendanceComplianceError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "ReportAttendanceComplianceError";
  }
}

export class ReportAttendanceComplianceNotFoundError extends ReportAttendanceComplianceError {
  constructor(id?: string | number) {
    super("ReportAttendanceCompliance record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class ReportAttendanceComplianceValidationError extends ReportAttendanceComplianceError {
  constructor(message?: string) {
    super(message || "ReportAttendanceCompliance validation failed", 400);
  }
}

export class ReportAttendanceComplianceUnauthorizedError extends ReportAttendanceComplianceError {
  constructor() {
    super("Unauthorized to perform this action on ReportAttendanceCompliance", 403);
  }
}

export class ReportAttendanceComplianceConflictError extends ReportAttendanceComplianceError {
  constructor(message: string = "ReportAttendanceCompliance conflict") {
    super(message, 409);
  }
}

export class ReportAttendanceComplianceForbiddenError extends ReportAttendanceComplianceError {
  constructor() {
    super("Forbidden: insufficient rights for ReportAttendanceCompliance", 403);
  }
}
