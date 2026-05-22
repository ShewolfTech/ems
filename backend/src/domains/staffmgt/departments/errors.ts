/**
 * Custom Errors for Departments
 * Auto-generated domain error classes
 */
export class DepartmentsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "DepartmentsError";
  }
}

export class DepartmentsNotFoundError extends DepartmentsError {
  constructor(id?: string | number) {
    super("Departments record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class DepartmentsValidationError extends DepartmentsError {
  constructor(message?: string) {
    super(message || "Departments validation failed", 400);
  }
}

export class DepartmentsUnauthorizedError extends DepartmentsError {
  constructor() {
    super("Unauthorized to perform this action on Departments", 403);
  }
}

export class DepartmentsConflictError extends DepartmentsError {
  constructor(message: string = "Departments conflict") {
    super(message, 409);
  }
}

export class DepartmentsForbiddenError extends DepartmentsError {
  constructor() {
    super("Forbidden: insufficient rights for Departments", 403);
  }
}
