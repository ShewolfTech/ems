// Auto-generated types for StaffmgtPromotionHistoryView

/**
 * Represents the full StaffmgtPromotionHistoryView record
 */
export type StaffmgtPromotionHistoryViewType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new StaffmgtPromotionHistoryView
 */
export type CreateStaffmgtPromotionHistoryViewInput = Partial<StaffmgtPromotionHistoryViewType>;

/**
 * Represents the data required to update an existing StaffmgtPromotionHistoryView
 */
export type UpdateStaffmgtPromotionHistoryViewInput = Partial<StaffmgtPromotionHistoryViewType>;
