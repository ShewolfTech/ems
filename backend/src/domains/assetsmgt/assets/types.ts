// Auto-generated types for Assets

/**
 * Represents the full Assets record
 */
export type AssetsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Assets
 */
export type CreateAssetsInput = Partial<AssetsType>;

/**
 * Represents the data required to update an existing Assets
 */
export type UpdateAssetsInput = Partial<AssetsType>;
