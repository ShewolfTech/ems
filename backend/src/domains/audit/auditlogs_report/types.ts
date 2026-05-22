// Auto-generated types for AuditlogsReport

/**
 * Represents the full AuditlogsReport record
 */
export type AuditlogsReportType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new AuditlogsReport
 */
export type CreateAuditlogsReportInput = Partial<AuditlogsReportType>;

/**
 * Represents the data required to update an existing AuditlogsReport
 */
export type UpdateAuditlogsReportInput = Partial<AuditlogsReportType>;
