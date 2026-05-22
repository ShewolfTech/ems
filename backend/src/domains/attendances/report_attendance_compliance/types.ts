// Auto-generated types for ReportAttendanceCompliance

/**
 * Represents the full ReportAttendanceCompliance record
 */
export type ReportAttendanceComplianceType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new ReportAttendanceCompliance
 */
export type CreateReportAttendanceComplianceInput = Partial<ReportAttendanceComplianceType>;

/**
 * Represents the data required to update an existing ReportAttendanceCompliance
 */
export type UpdateReportAttendanceComplianceInput = Partial<ReportAttendanceComplianceType>;
