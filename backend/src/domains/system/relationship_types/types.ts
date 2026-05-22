// Auto-generated types for RelationshipTypes

/**
 * Represents the full RelationshipTypes record
 */
export type RelationshipTypesType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new RelationshipTypes
 */
export type CreateRelationshipTypesInput = Partial<RelationshipTypesType>;

/**
 * Represents the data required to update an existing RelationshipTypes
 */
export type UpdateRelationshipTypesInput = Partial<RelationshipTypesType>;
