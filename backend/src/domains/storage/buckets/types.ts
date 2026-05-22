// Auto-generated types for Buckets

/**
 * Represents the full Buckets record
 */
export type BucketsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Buckets
 */
export type CreateBucketsInput = Partial<BucketsType>;

/**
 * Represents the data required to update an existing Buckets
 */
export type UpdateBucketsInput = Partial<BucketsType>;
