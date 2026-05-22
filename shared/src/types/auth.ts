export type PermissionMap = {
  [domain: string]: {
    [resource: string]: {
      [action: string]: string;
    };
  };
};

export interface PermissionsMetaRow {
  module: string;
  moduleName: string;
  resource: string;
  route: string;
  icon: string | null;
  displayName: string;
  module_order: number;
  display_order: number;
}

export interface EnrichedUserMetadata {
  full_name: string;
  school_name: string;
  school_code: string;
  school_address: string;
  school_phone: string;
  school_email: string;
  school_logo_url: string;
  permissions_meta: PermissionsMetaRow[];
  permission_map: PermissionMap;
  last_enriched: string;
}

export interface TokenPayload {
  userId: number;
  roleId: number;
  schoolId: number;
  sessionId: string;
}

export interface AuthSession {
  token: string;
  userId: number;
  sessionId: string;
  user: {
    id: number;
    username: string;
    email?: string | null;
    firstName?: string;
    lastName?: string;
    schoolId: number;
  };
  metadata: EnrichedUserMetadata;
}

export interface PermissionsMetaRow {
  module: string;
  moduleName: string;
  resource: string;
  route: string;
  icon: string | null;
  displayName: string;
  module_order: number;
  display_order: number;
}

export interface EnrichedUserMetadata {
  full_name: string;
  school_name: string;
  school_code: string;
  school_address: string;
  school_phone: string;
  school_email: string;
  school_logo_url: string;
  permissions_meta: PermissionsMetaRow[];
  permission_map: PermissionMap;
  last_enriched: string;
}

export interface TokenPayload {
  userId: number;
  roleId: number;
  schoolId: number;
  sessionId: string;
}

export interface AuthSession {
  token: string;
  userId: number;
  sessionId: string;
  user: {
    id: number;
    username: string;
    email?: string | null;
    firstName?: string;
    lastName?: string;
    schoolId: number;
  };
  metadata: EnrichedUserMetadata;
}
