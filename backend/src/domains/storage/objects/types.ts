// Auto-generated types for Objects

/**
 * Represents the full Objects record
 */
export type ObjectsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Objects
 */
export type CreateObjectsInput = Partial<ObjectsType>;

/**
 * Represents the data required to update an existing Objects
 */
export type UpdateObjectsInput = Partial<ObjectsType>;
