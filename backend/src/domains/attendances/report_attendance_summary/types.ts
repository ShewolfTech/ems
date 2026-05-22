// Auto-generated types for ReportAttendanceSummary

/**
 * Represents the full ReportAttendanceSummary record
 */
export type ReportAttendanceSummaryType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new ReportAttendanceSummary
 */
export type CreateReportAttendanceSummaryInput = Partial<ReportAttendanceSummaryType>;

/**
 * Represents the data required to update an existing ReportAttendanceSummary
 */
export type UpdateReportAttendanceSummaryInput = Partial<ReportAttendanceSummaryType>;
