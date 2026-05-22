// Auto-generated types for SystemRolerouteAccessView

/**
 * Represents the full SystemRolerouteAccessView record
 */
export type SystemRolerouteAccessViewType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new SystemRolerouteAccessView
 */
export type CreateSystemRolerouteAccessViewInput = Partial<SystemRolerouteAccessViewType>;

/**
 * Represents the data required to update an existing SystemRolerouteAccessView
 */
export type UpdateSystemRolerouteAccessViewInput = Partial<SystemRolerouteAccessViewType>;
