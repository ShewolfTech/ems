// Auto-generated types for CustomFields

/**
 * Represents the full CustomFields record
 */
export type CustomFieldsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new CustomFields
 */
export type CreateCustomFieldsInput = Partial<CustomFieldsType>;

/**
 * Represents the data required to update an existing CustomFields
 */
export type UpdateCustomFieldsInput = Partial<CustomFieldsType>;
