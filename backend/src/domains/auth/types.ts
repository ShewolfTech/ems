/**
 * BACKEND AUTH TYPES
 * Integrated with Kysely and Supabase logic.
 */
export interface TokenPayload {
  userId: string | number;
  roleId: string | number;
  schoolId: number;
  sessionId: string;
  permissions: string[]; // Standard: 'module.resource.action'
}

export interface AuthSession {
  token: string;
  userId: string;
  sessionId: string;
}

export interface PermissionsMetaRow {
  module: string;
  resource: string;
  route: string;
  action: string;
  is_menu_item: boolean;
  icon?: string;
  fullCode: string; // The "resource.action" string for permission checks
  displayName: string;
  display_order?: number;
  group_name?: string;  // sidebar sub-group key
  moduleName: string;
  module_order?: number;
}

/**
 * Added missing enrichment response type 
 * required by enrichUserMetadata.ts
 */
export interface UserMetadataEnrichment {
  success: boolean;
  school: {
    name: string;
    code: string;
    address: string;
    phone: string;
    email: string;
    logo: string | null;
  } | null;
  permissions: string[];
  permissions_meta: PermissionsMetaRow[];
}