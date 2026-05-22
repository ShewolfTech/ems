// Auto-generated types for Files

/**
 * Represents the full Files record
 */
export type FilesType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Files
 */
export type CreateFilesInput = Partial<FilesType>;

/**
 * Represents the data required to update an existing Files
 */
export type UpdateFilesInput = Partial<FilesType>;
