import { db } from "../../config/infra/database.js";
import { sql } from "kysely";
import { UserMetadataEnrichment, PermissionsMetaRow } from "./types.js";

/**
 * Enriches user data with school details and granular permissions.
 * This is the 'Hydration Engine' that keeps the JWT slim but the app functional.
 */
export async function enrichUserMetadata(
  email: string,
  schoolId: number,
  userId: string | number,
): Promise<UserMetadataEnrichment> {
  try {
    // 1. Fetch school info with strict validation
    const schoolResult = await db
      .selectFrom("schools")
      .select([
        "name",
        "code",
        "address",
        "contact_phone as phone",
        "contact_email as email",
        "logo_url as logo",
      ] as any)
      .where("id", "=", Number(schoolId) as any)
      .executeTakeFirst();

    // 🛡️ CRITICAL: If no school is found, we should not proceed.
    // This prevents "Ghost Logins" when the database is empty or mismatched.
    if (!schoolResult) {
      console.error(`[ENRICHMENT_BLOCK]: School ID ${schoolId} not found in database.`);
      return { 
        success: false, 
        school: null, 
        permissions: [], 
        permissions_meta: [] 
      };
    }

    const school = schoolResult as UserMetadataEnrichment['school'];

    // 2. First, try to get user's role_id from the users table
    const userResult = await db
      .selectFrom("users" as any)
      .select(["role_id"] as any)
      .where("id", "=", Number(userId))
      .executeTakeFirst() as { role_id: number } | undefined;

    const roleId = userResult?.role_id;

    // 3. Fetch permissions from user_permissions table
    // This query connects the raw permission to the UI-friendly route/icon data
    const userPermsData = await sql<PermissionsMetaRow>`
        SELECT
            p.module,
            p.resource,
            p.action,
            p.permission_key AS "fullCode",
            rp.route,
            rp.display_name AS "displayName",
            rp.icon,
            rp.is_menu_item,
            rp.display_order,
            rp.group_name,
            p.module AS "moduleName"
        FROM public.user_permissions up
        INNER JOIN public.permissions p ON p.id = up.permission_id
        LEFT JOIN public.route_permissions rp ON rp.permission_key = p.permission_key
        WHERE up.user_id = ${Number(userId)}
          AND up.school_id = ${Number(schoolId)}
          AND up.is_allowed = true
          AND up.is_active = true
          AND p.is_deleted = false
          AND p.is_active = true
        ORDER BY p.module, rp.display_order ASC
      `.execute(db);

    let rows = (userPermsData.rows || []) as PermissionsMetaRow[];

    // 4. If no user_permissions, try role_permissions based on user's role
    if (rows.length === 0 && roleId) {
        console.log(`[ENRICHMENT_INFO]: No user_permissions found, checking role_permissions for role ${roleId}`);
        
        const rolePermsData = await sql<PermissionsMetaRow>`
            SELECT
                p.module,
                p.resource,
                p.action,
                p.permission_key AS "fullCode",
                rp.route,
                rp.display_name AS "displayName",
                rp.icon,
                rp.is_menu_item,
                rp.display_order,
                rp.group_name,
                p.module AS "moduleName"
            FROM public.role_permissions rp2
            INNER JOIN public.permissions p ON p.id = rp2.permission_id
            LEFT JOIN public.route_permissions rp ON rp.permission_key = p.permission_key
            WHERE rp2.role_id = ${Number(roleId)}
              AND rp2.school_id = ${Number(schoolId)}
              AND rp2.is_allowed = true
              AND rp2.is_active = true
              AND p.is_deleted = false
              AND p.is_active = true
            ORDER BY p.module, rp.display_order ASC
          `.execute(db);

        rows = (rolePermsData.rows || []) as PermissionsMetaRow[];
    }

    // 🛡️ CRITICAL: If a user has NO permissions for this school, they shouldn't be "in".
    if (rows.length === 0) {
        console.warn(`[ENRICHMENT_WARNING]: User ${userId} has no active permissions for School ${schoolId}`);
    }

    return {
      success: true,
      school: school || null,
      // Extract unique permission keys (e.g., 'users.read', 'classes.write')
      permissions: [...new Set(rows.map((p) => p.fullCode))],
      // Full objects for the Sidebar/Menu generation
      permissions_meta: rows,
    };
  } catch (error) {
    // Log the error so we can see it in the backend terminal
    console.error(`[ENRICHMENT_ERROR] Failed for User: ${userId} @ School: ${schoolId}:`, error);
    
    return { 
      success: false, 
      school: null, 
      permissions: [], 
      permissions_meta: [] 
    };
  }
}