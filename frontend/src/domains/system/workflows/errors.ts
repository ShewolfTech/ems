/**
 * Auto-generated error classes for Workflows
 */

export class WorkflowsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowsValidationError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WorkflowsValidationError);
    }
  }
}

export class WorkflowsServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowsServiceError";
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WorkflowsServiceError);
    }
  }
}
