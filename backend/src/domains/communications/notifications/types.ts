// Auto-generated types for Notifications

/**
 * Represents the full Notifications record
 */
export type NotificationsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Notifications
 */
export type CreateNotificationsInput = Partial<NotificationsType>;

/**
 * Represents the data required to update an existing Notifications
 */
export type UpdateNotificationsInput = Partial<NotificationsType>;
