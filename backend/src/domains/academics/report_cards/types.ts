// Auto-generated types for ReportCards

/**
 * Represents the full ReportCards record
 */
export type ReportCardsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new ReportCards
 */
export type CreateReportCardsInput = Partial<ReportCardsType>;

/**
 * Represents the data required to update an existing ReportCards
 */
export type UpdateReportCardsInput = Partial<ReportCardsType>;
