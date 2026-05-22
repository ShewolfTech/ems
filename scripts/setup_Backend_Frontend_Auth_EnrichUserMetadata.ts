// scripts/genEnrichUserMetadata.ts
import { promises as fs } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const AUTH_DIR = path.join(projectRoot, "backend/src/domains/auth");

const enrichmentContent = `
import { db } from "../../config/infra/database.js";
import { sql } from "kysely";

/**
 * METADATA ENRICHMENT SERVICE
 * Transforms raw database roles and permissions into a flat array of
 * dot-notation strings for the frontend.
 */
export async function enrichUserMetadata(email: string, schoolId: number, userId: string | number) {
  // We cast db to 'any' here because Kysely's strict type system cannot 
  // resolve dynamic joins when using sql.raw table names.
  const permissions = await (db as any)
    .selectFrom('userRoles as ur')
    .innerJoin('rolePermissions as rp', 'rp.roleId', 'ur.roleId')
    .innerJoin('permissions as p', 'p.id', 'rp.permissionId')
    .select([
      'p.module as module',
      'p.resource as resource',
      'p.action as action'
    ])
    .where('ur.userId', '=', userId)
    .execute();

  // Convert DB rows into: ["academics.classes.view", "finance.fees.edit"]
  const dotNotationArray = (permissions || []).map((p: any) => 
    \`\${p.module}.\${p.resource}.\${p.action}\`
  );

  if (dotNotationArray.length > 0) {
    return {
      success: true,
      permissions: dotNotationArray,
      lastLogin: new Date().toISOString()
    };
  } else {
    return {
      success: false,
      reason: "No permissions found",
      permissions: [],
      lastLogin: new Date().toISOString()
    };
  }
}
`;

async function run() {
  try {
    await fs.mkdir(AUTH_DIR, { recursive: true });
    await fs.writeFile(path.join(AUTH_DIR, "enrichUserMetadata.ts"), enrichmentContent.trim());

    console.log("--------------------------------------------------");
    console.log("✅ FIXED: enrichUserMetadata.ts");
    console.log("✅ Added: success / reason fields for route checks");
    console.log("✅ Logic: Returns explicit success/failure with permissions array");
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("❌ Failed to generate enrichUserMetadata.ts:", error);
  }
}

run();
