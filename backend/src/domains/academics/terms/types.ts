// Auto-generated types for Terms

/**
 * Represents the full Terms record
 */
export type TermsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Terms
 */
export type CreateTermsInput = Partial<TermsType>;

/**
 * Represents the data required to update an existing Terms
 */
export type UpdateTermsInput = Partial<TermsType>;
