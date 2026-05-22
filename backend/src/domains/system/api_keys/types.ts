// Auto-generated types for ApiKeys

/**
 * Represents the full ApiKeys record
 */
export type ApiKeysType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new ApiKeys
 */
export type CreateApiKeysInput = Partial<ApiKeysType>;

/**
 * Represents the data required to update an existing ApiKeys
 */
export type UpdateApiKeysInput = Partial<ApiKeysType>;
