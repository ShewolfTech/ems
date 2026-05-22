// Auto-generated types for Workflows

/**
 * Represents the full Workflows record
 */
export type WorkflowsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Workflows
 */
export type CreateWorkflowsInput = Partial<WorkflowsType>;

/**
 * Represents the data required to update an existing Workflows
 */
export type UpdateWorkflowsInput = Partial<WorkflowsType>;
