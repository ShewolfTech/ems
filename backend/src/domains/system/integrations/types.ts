// Auto-generated types for Integrations

/**
 * Represents the full Integrations record
 */
export type IntegrationsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Integrations
 */
export type CreateIntegrationsInput = Partial<IntegrationsType>;

/**
 * Represents the data required to update an existing Integrations
 */
export type UpdateIntegrationsInput = Partial<IntegrationsType>;
