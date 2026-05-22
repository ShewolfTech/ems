/**
 * Custom Errors for AttendancePolicies
 * Auto-generated domain error classes
 */
export class AttendancePoliciesError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "AttendancePoliciesError";
  }
}

export class AttendancePoliciesNotFoundError extends AttendancePoliciesError {
  constructor(id?: string | number) {
    super("AttendancePolicies record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class AttendancePoliciesValidationError extends AttendancePoliciesError {
  constructor(message?: string) {
    super(message || "AttendancePolicies validation failed", 400);
  }
}

export class AttendancePoliciesUnauthorizedError extends AttendancePoliciesError {
  constructor() {
    super("Unauthorized to perform this action on AttendancePolicies", 403);
  }
}

export class AttendancePoliciesConflictError extends AttendancePoliciesError {
  constructor(message: string = "AttendancePolicies conflict") {
    super(message, 409);
  }
}

export class AttendancePoliciesForbiddenError extends AttendancePoliciesError {
  constructor() {
    super("Forbidden: insufficient rights for AttendancePolicies", 403);
  }
}
