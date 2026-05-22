// Auto-generated types for ContactTypes

/**
 * Represents the full ContactTypes record
 */
export type ContactTypesType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new ContactTypes
 */
export type CreateContactTypesInput = Partial<ContactTypesType>;

/**
 * Represents the data required to update an existing ContactTypes
 */
export type UpdateContactTypesInput = Partial<ContactTypesType>;
