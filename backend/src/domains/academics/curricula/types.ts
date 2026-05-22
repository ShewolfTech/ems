// Auto-generated types for Curricula

/**
 * Represents the full Curricula record
 */
export type CurriculaType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Curricula
 */
export type CreateCurriculaInput = Partial<CurriculaType>;

/**
 * Represents the data required to update an existing Curricula
 */
export type UpdateCurriculaInput = Partial<CurriculaType>;
