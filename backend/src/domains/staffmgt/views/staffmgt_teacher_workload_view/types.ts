// Auto-generated types for StaffmgtTeacherWorkloadView

/**
 * Represents the full StaffmgtTeacherWorkloadView record
 */
export type StaffmgtTeacherWorkloadViewType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new StaffmgtTeacherWorkloadView
 */
export type CreateStaffmgtTeacherWorkloadViewInput = Partial<StaffmgtTeacherWorkloadViewType>;

/**
 * Represents the data required to update an existing StaffmgtTeacherWorkloadView
 */
export type UpdateStaffmgtTeacherWorkloadViewInput = Partial<StaffmgtTeacherWorkloadViewType>;
