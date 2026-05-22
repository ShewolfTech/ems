// Auto-generated types for AcademicYears

/**
 * Represents the full AcademicYears record
 */
export type AcademicYearsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new AcademicYears
 */
export type CreateAcademicYearsInput = Partial<AcademicYearsType>;

/**
 * Represents the data required to update an existing AcademicYears
 */
export type UpdateAcademicYearsInput = Partial<AcademicYearsType>;
