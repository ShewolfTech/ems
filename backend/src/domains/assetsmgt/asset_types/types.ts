// Auto-generated types for AssetTypes

/**
 * Represents the full AssetTypes record
 */
export type AssetTypesType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new AssetTypes
 */
export type CreateAssetTypesInput = Partial<AssetTypesType>;

/**
 * Represents the data required to update an existing AssetTypes
 */
export type UpdateAssetTypesInput = Partial<AssetTypesType>;
