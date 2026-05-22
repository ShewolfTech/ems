/**
 * Custom Errors for Workflows
 * Auto-generated domain error classes
 */
export class WorkflowsError extends Error {
  constructor(public message: string, public statusCode: number = 500) {
    super(message);
    this.name = "WorkflowsError";
  }
}

export class WorkflowsNotFoundError extends WorkflowsError {
  constructor(id?: string | number) {
    super("Workflows record" + (id ? " with ID " + id : "") + " not found", 404);
  }
}

export class WorkflowsValidationError extends WorkflowsError {
  constructor(message?: string) {
    super(message || "Workflows validation failed", 400);
  }
}

export class WorkflowsUnauthorizedError extends WorkflowsError {
  constructor() {
    super("Unauthorized to perform this action on Workflows", 403);
  }
}

export class WorkflowsConflictError extends WorkflowsError {
  constructor(message: string = "Workflows conflict") {
    super(message, 409);
  }
}

export class WorkflowsForbiddenError extends WorkflowsError {
  constructor() {
    super("Forbidden: insufficient rights for Workflows", 403);
  }
}
