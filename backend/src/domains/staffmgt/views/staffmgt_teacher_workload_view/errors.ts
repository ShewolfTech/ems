/**
 * Custom Errors for StaffmgtTeacherWorkloadView
 * Auto-generated domain error classes
 */
export class StaffmgtTeacherWorkloadViewError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "StaffmgtTeacherWorkloadViewError";
  }
}

export class StaffmgtTeacherWorkloadViewNotFoundError extends StaffmgtTeacherWorkloadViewError {
  constructor(id?: string | number) {
    super("StaffmgtTeacherWorkloadView record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class StaffmgtTeacherWorkloadViewValidationError extends StaffmgtTeacherWorkloadViewError {
  constructor(message?: string) {
    super(message || "StaffmgtTeacherWorkloadView validation failed", 400);
  }
}

export class StaffmgtTeacherWorkloadViewUnauthorizedError extends StaffmgtTeacherWorkloadViewError {
  constructor() {
    super("Unauthorized to perform this action on StaffmgtTeacherWorkloadView", 403);
  }
}

export class StaffmgtTeacherWorkloadViewConflictError extends StaffmgtTeacherWorkloadViewError {
  constructor(message: string = "StaffmgtTeacherWorkloadView conflict") {
    super(message, 409);
  }
}

export class StaffmgtTeacherWorkloadViewForbiddenError extends StaffmgtTeacherWorkloadViewError {
  constructor() {
    super("Forbidden: insufficient rights for StaffmgtTeacherWorkloadView", 403);
  }
}
