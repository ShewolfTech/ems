// Auto-generated types for ReportLeaveSummary

/**
 * Represents the full ReportLeaveSummary record
 */
export type ReportLeaveSummaryType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new ReportLeaveSummary
 */
export type CreateReportLeaveSummaryInput = Partial<ReportLeaveSummaryType>;

/**
 * Represents the data required to update an existing ReportLeaveSummary
 */
export type UpdateReportLeaveSummaryInput = Partial<ReportLeaveSummaryType>;
