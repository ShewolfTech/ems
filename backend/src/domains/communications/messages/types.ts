// Auto-generated types for Messages

/**
 * Represents the full Messages record
 */
export type MessagesType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Messages
 */
export type CreateMessagesInput = Partial<MessagesType>;

/**
 * Represents the data required to update an existing Messages
 */
export type UpdateMessagesInput = Partial<MessagesType>;
