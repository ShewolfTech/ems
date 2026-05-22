// Auto-generated types for Genders

/**
 * Represents the full Genders record
 */
export type GendersType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Genders
 */
export type CreateGendersInput = Partial<GendersType>;

/**
 * Represents the data required to update an existing Genders
 */
export type UpdateGendersInput = Partial<GendersType>;
