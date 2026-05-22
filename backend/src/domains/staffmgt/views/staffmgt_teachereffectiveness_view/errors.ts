/**
 * Custom Errors for StaffmgtTeachereffectivenessView
 * Auto-generated domain error classes
 */
export class StaffmgtTeachereffectivenessViewError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "StaffmgtTeachereffectivenessViewError";
  }
}

export class StaffmgtTeachereffectivenessViewNotFoundError extends StaffmgtTeachereffectivenessViewError {
  constructor(id?: string | number) {
    super("StaffmgtTeachereffectivenessView record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class StaffmgtTeachereffectivenessViewValidationError extends StaffmgtTeachereffectivenessViewError {
  constructor(message?: string) {
    super(message || "StaffmgtTeachereffectivenessView validation failed", 400);
  }
}

export class StaffmgtTeachereffectivenessViewUnauthorizedError extends StaffmgtTeachereffectivenessViewError {
  constructor() {
    super("Unauthorized to perform this action on StaffmgtTeachereffectivenessView", 403);
  }
}

export class StaffmgtTeachereffectivenessViewConflictError extends StaffmgtTeachereffectivenessViewError {
  constructor(message: string = "StaffmgtTeachereffectivenessView conflict") {
    super(message, 409);
  }
}

export class StaffmgtTeachereffectivenessViewForbiddenError extends StaffmgtTeachereffectivenessViewError {
  constructor() {
    super("Forbidden: insufficient rights for StaffmgtTeachereffectivenessView", 403);
  }
}
