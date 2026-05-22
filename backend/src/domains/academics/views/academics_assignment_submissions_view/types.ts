// Auto-generated types for AcademicsAssignmentSubmissionsView

/**
 * Represents the full AcademicsAssignmentSubmissionsView record
 */
export type AcademicsAssignmentSubmissionsViewType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new AcademicsAssignmentSubmissionsView
 */
export type CreateAcademicsAssignmentSubmissionsViewInput = Partial<AcademicsAssignmentSubmissionsViewType>;

/**
 * Represents the data required to update an existing AcademicsAssignmentSubmissionsView
 */
export type UpdateAcademicsAssignmentSubmissionsViewInput = Partial<AcademicsAssignmentSubmissionsViewType>;
