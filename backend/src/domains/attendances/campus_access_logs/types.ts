// Auto-generated types for CampusAccessLogs

/**
 * Represents the full CampusAccessLogs record
 */
export type CampusAccessLogsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new CampusAccessLogs
 */
export type CreateCampusAccessLogsInput = Partial<CampusAccessLogsType>;

/**
 * Represents the data required to update an existing CampusAccessLogs
 */
export type UpdateCampusAccessLogsInput = Partial<CampusAccessLogsType>;
