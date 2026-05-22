// scripts/genPermissionMap.ts
import fs from "fs";
import path from "path";
import { permissionRegistry } from "../backend/src/registries/permissions/permissionRegistry.ts";

const enumFile = path.resolve("backend/src/registries/permissions/permissionsEnum.ts");
const outputFile = path.resolve("backend/src/registries/permissions/PermissionMap.ts");

// Parse enum file into a dictionary
function loadPermissionsEnum(): Record<string, string> {
  const content = fs.readFileSync(enumFile, "utf-8");
  const regex = /^\s*([A-Z0-9_]+)\s*=\s*"([^"]+)"/gm;
  const dict: Record<string, string> = {};
  let match;
  while ((match = regex.exec(content)) !== null) {
    dict[match[1]] = match[2];
  }
  return dict;
}

function buildMap(Permissions: Record<string, string>) {
  const map: Record<string, any> = {};
  for (const [domain, resources] of Object.entries(permissionRegistry)) {
    map[domain] = {};
    for (const [resource, actions] of Object.entries(resources as Record<string, string[]>)) {
      map[domain][resource] = {};
      for (const action of actions) {
        const enumKey = `${domain}_${resource}_${action}`.toUpperCase().replace(/\./g, "_");
        const enumValue = Permissions[enumKey];
        if (!enumValue) {
          console.warn(`⚠️ Missing enum for ${domain}:${resource}:${action}`);
        }
        const shortKey = action.split(".").pop()!;
        map[domain][resource][shortKey] = enumValue;
      }
    }
  }
  return map;
}

function run() {
  console.log("🔥 Generating PermissionMap.ts...");
  const Permissions = loadPermissionsEnum();
  const map = buildMap(Permissions);

  const fileContent = `// Auto-generated permission map
import { Permissions } from "./permissionsEnum.js";

export const PermissionMap = ${JSON.stringify(map, null, 2)} as const;
`;

  fs.writeFileSync(outputFile, fileContent);
  console.log("✅ PermissionMap.ts generated at", outputFile);
}

run();
