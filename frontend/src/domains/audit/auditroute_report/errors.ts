/**
 * Auto-generated error classes for AuditrouteReport
 */

export class AuditrouteReportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuditrouteReportValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuditrouteReportValidationError);
    }
  }
}

export class AuditrouteReportServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuditrouteReportServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuditrouteReportServiceError);
    }
  }
}
