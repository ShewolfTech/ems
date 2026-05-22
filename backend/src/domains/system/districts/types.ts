// Auto-generated types for Districts

/**
 * Represents the full Districts record
 */
export type DistrictsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Districts
 */
export type CreateDistrictsInput = Partial<DistrictsType>;

/**
 * Represents the data required to update an existing Districts
 */
export type UpdateDistrictsInput = Partial<DistrictsType>;
