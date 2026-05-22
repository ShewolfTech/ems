// Auto-generated types for Secrets

/**
 * Represents the full Secrets record
 */
export type SecretsType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Secrets
 */
export type CreateSecretsInput = Partial<SecretsType>;

/**
 * Represents the data required to update an existing Secrets
 */
export type UpdateSecretsInput = Partial<SecretsType>;
