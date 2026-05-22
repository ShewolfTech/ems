// Auto-generated types for AuditrouteReport

/**
 * Represents the full AuditrouteReport record
 */
export type AuditrouteReportType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new AuditrouteReport
 */
export type CreateAuditrouteReportInput = Partial<AuditrouteReportType>;

/**
 * Represents the data required to update an existing AuditrouteReport
 */
export type UpdateAuditrouteReportInput = Partial<AuditrouteReportType>;
