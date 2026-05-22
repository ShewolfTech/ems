// Auto-generated types for AssetAssignments

/**
 * Represents the full AssetAssignments record
 */
export type AssetAssignmentsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new AssetAssignments
 */
export type CreateAssetAssignmentsInput = Partial<AssetAssignmentsType>;

/**
 * Represents the data required to update an existing AssetAssignments
 */
export type UpdateAssetAssignmentsInput = Partial<AssetAssignmentsType>;
