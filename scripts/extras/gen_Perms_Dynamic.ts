// scripts/gen_Perms_Dynamic.ts
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env first
dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

// Use permissionsmgt as the domain root
const backendBase = path.resolve(__dirname, "../backend/src/domains/permissionsmgt");
const frontendBase = path.resolve(__dirname, "../frontend/src/domains/permissionsmgt");

function capitalize(name: string) {
  return name.replace(/(^|_)(\w)/g, (_, __, c) => c.toUpperCase());
}

// Step 1: Query DB for permissions tables
async function getPermissionTables(): Promise<string[]> {
  const { pool } = await import(
    pathToFileURL(path.resolve(__dirname, "../shared/src/db/database.ts")).href
  );

  const result = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('permissions','roles','users','route_permissions')
  `);

  await pool.end();
  return result.rows.map((r: any) => r.table_name as string);
}

// Step 2: Scaffold per-table resources
async function scaffoldResource(resource: string) {
  const pascalName = capitalize(resource);

  const backendPath = path.join(backendBase, resource);
  const frontendPath = path.join(frontendBase, resource);

  const backendFiles = [
    "types.ts","validator.ts","controller.ts","service.ts",
    "errors.ts","routes.ts","auditLogger.ts","index.ts"
  ];
  const frontendFiles = [
    "types.ts","validator.ts","controller.ts","services.ts",
    "errors.ts","routes.ts","auditLogger.ts","index.ts"
  ];

  for (const f of backendFiles) {
    const filePath = path.join(backendPath, f);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `// Auto-generated ${f} for ${pascalName}`);
  }

  for (const f of frontendFiles) {
    const filePath = path.join(frontendPath, f);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `// Auto-generated ${f} for ${pascalName}`);
  }

  console.log(`✅ Scaffolding complete for ${pascalName}`);
}

// Step 3: Scaffold common files
async function scaffoldCommon() {
  // PermissionsProvider
  const providerFile = path.join(frontendBase, "PermissionsProvider.tsx");
  fs.mkdirSync(path.dirname(providerFile), { recursive: true });
  fs.writeFileSync(providerFile, `// Auto-generated PermissionsProvider
import React, { createContext, useState, useEffect, ReactNode } from "react";
import * as controller from "./controller";

interface PermissionsContextValue {
  userPermissions: string[];
  refreshPermissions: () => Promise<void>;
}

export const PermissionsContext = createContext<PermissionsContextValue>({
  userPermissions: [],
  refreshPermissions: async () => {},
});

interface Props { userId: number; children: ReactNode; }

export function PermissionsProvider({ userId, children }: Props) {
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  async function refreshPermissions() {
    try {
      const res = await controller.listPermissions(userId);
      setUserPermissions(res.data);
    } catch (err) {
      console.error("[PermissionsProvider] Failed to load permissions", err);
      setUserPermissions([]);
    }
  }
  useEffect(() => { refreshPermissions(); }, [userId]);
  return (
    <PermissionsContext.Provider value={{ userPermissions, refreshPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
}
`);

  // hooks.ts
  const hooksFile = path.join(frontendBase, "hooks.ts");
  fs.writeFileSync(hooksFile, `// Auto-generated hooks
import { useContext } from "react";
import { PermissionsContext } from "./PermissionsProvider";

export function usePermissions() { return useContext(PermissionsContext); }
export function useHasPermission(permission: string) {
  const { userPermissions } = usePermissions();
  return userPermissions.includes(permission);
}
`);

  // utils.ts
  const utilsFile = path.join(frontendBase, "utils.ts");
  fs.writeFileSync(utilsFile, `// Auto-generated utils
export function expandManage(resource: string, perms: string[]): string[] {
  const expanded: string[] = [];
  for (const p of perms) {
    if (p.endsWith(".manage")) {
      const base = p.replace(".manage", "");
      expanded.push(\`\${base}.create\`, \`\${base}.read\`, \`\${base}.update\`, \`\${base}.delete\`, \`\${base}.export\`);
    } else {
      expanded.push(p);
      if (p.endsWith(".create") || p.endsWith(".update") || p.endsWith(".delete")) {
        expanded.push(\`\${resource}.read\`);
      }
    }
  }
  return Array.from(new Set(expanded));
}
`);

  // components
  const compDir = path.join(frontendBase, "components");
  fs.mkdirSync(compDir, { recursive: true });
  fs.writeFileSync(path.join(compDir, "PermissionGate.tsx"), `// Auto-generated PermissionGate
import { ReactNode } from "react";
import { useHasPermission } from "../hooks";

interface Props { permission: string; children: ReactNode; }
export function PermissionGate({ permission, children }: Props) {
  const allowed = useHasPermission(permission);
  return allowed ? <>{children}</> : null;
}
`);

  fs.writeFileSync(path.join(compDir, "RoleManager.tsx"), `// Auto-generated RoleManager
import { useState, useEffect } from "react";
import * as controller from "../controller";

export function RoleManager() {
  const [roles, setRoles] = useState<any[]>([]);
  useEffect(() => { controller.listRoles().then(res => setRoles(res.data)); }, []);
  return <div><h2>Roles</h2><ul>{roles.map(r => <li key={r.id}>{r.name}</li>)}</ul></div>;
}
`);

  fs.writeFileSync(path.join(compDir, "UserPermissionEditor.tsx"), `// Auto-generated UserPermissionEditor
import { useState } from "react";
export function UserPermissionEditor() {
  const [permissions, setPermissions] = useState<string[]>([]);
  return <div>Edit user permissions here</div>;
}
`);

  fs.writeFileSync(path.join(compDir, "RoutePermissionManager.tsx"), `// Auto-generated RoutePermissionManager
export function RoutePermissionManager() {
  return <div>Manage route-to-permission mappings here</div>;
}
`);

  // index.ts
  const barrelFile = path.join(frontendBase, "index.ts");
  fs.writeFileSync(barrelFile, `// Auto-generated permissionsmgt barrel
export * from "./PermissionsProvider";
export * from "./hooks";
export * from "./utils";
export * from "./components/PermissionGate";
export * from "./components/RoleManager";
export * from "./components/UserPermissionEditor";
export * from "./components/RoutePermissionManager";
`);

  console.log("✅ Common permissionsmgt scaffolding generated");
}

// Step 4: Run
async function run() {
  const tables = await getPermissionTables();
  for (const table of tables) {
    await scaffoldResource(table);
  }
  await scaffoldCommon();
  console.log("✨ Permissionsmgt domain refreshed successfully!");
}

run().catch(err => {
  console.error("❌ Error refreshing permissionsmgt domain:", err);
  process.exit(1);
});
