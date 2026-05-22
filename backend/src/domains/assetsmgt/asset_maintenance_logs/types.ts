// Auto-generated types for AssetMaintenanceLogs

/**
 * Represents the full AssetMaintenanceLogs record
 */
export type AssetMaintenanceLogsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new AssetMaintenanceLogs
 */
export type CreateAssetMaintenanceLogsInput = Partial<AssetMaintenanceLogsType>;

/**
 * Represents the data required to update an existing AssetMaintenanceLogs
 */
export type UpdateAssetMaintenanceLogsInput = Partial<AssetMaintenanceLogsType>;
