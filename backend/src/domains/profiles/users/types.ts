// Auto-generated types for Users

/**
 * Represents the full Users record
 */
export type UsersType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Users
 */
export type CreateUsersInput = Partial<UsersType>;

/**
 * Represents the data required to update an existing Users
 */
export type UpdateUsersInput = Partial<UsersType>;
