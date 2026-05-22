// Auto-generated types for AcademicsClassscheduleView

/**
 * Represents the full AcademicsClassscheduleView record
 */
export type AcademicsClassscheduleViewType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new AcademicsClassscheduleView
 */
export type CreateAcademicsClassscheduleViewInput = Partial<AcademicsClassscheduleViewType>;

/**
 * Represents the data required to update an existing AcademicsClassscheduleView
 */
export type UpdateAcademicsClassscheduleViewInput = Partial<AcademicsClassscheduleViewType>;
