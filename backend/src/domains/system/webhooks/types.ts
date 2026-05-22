// Auto-generated types for Webhooks

/**
 * Represents the full Webhooks record
 */
export type WebhooksType = {
  id?: number;
  school_id?: number;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

/**
 * Represents the data required to create a new Webhooks
 */
export type CreateWebhooksInput = Partial<WebhooksType>;

/**
 * Represents the data required to update an existing Webhooks
 */
export type UpdateWebhooksInput = Partial<WebhooksType>;
