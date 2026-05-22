// Auto-generated types for Settings

/**
 * Represents the full Settings record
 */
export type SettingsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Settings
 */
export type CreateSettingsInput = Partial<SettingsType>;

/**
 * Represents the data required to update an existing Settings
 */
export type UpdateSettingsInput = Partial<SettingsType>;
