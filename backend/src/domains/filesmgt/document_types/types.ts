// Auto-generated types for DocumentTypes

/**
 * Represents the full DocumentTypes record
 */
export type DocumentTypesType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new DocumentTypes
 */
export type CreateDocumentTypesInput = Partial<DocumentTypesType>;

/**
 * Represents the data required to update an existing DocumentTypes
 */
export type UpdateDocumentTypesInput = Partial<DocumentTypesType>;
